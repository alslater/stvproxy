#!/usr/bin/env python

import redis
import configparser
import json
import os
import subprocess
import logging

'''
   See config-example.json for an example configuration

'''

config = {}

def retrieve_config():
    global config
    ini = configparser.ConfigParser()
    ini.read("task-runner.ini")
    try:
        redis_host = ini["redis"]["host"]
        config_key = ini["redis"].get("config_key", "stvproxy:config")
    except KeyError:
        logging.info("Invalid ini file")
        exit(1)        

    r = redis.Redis(host=redis_host)
    try:
        config = json.loads(r.get(config_key))
    except json.decoder.JSONDecodeError as e:
        logging.info(f"Config format error : {e.msg}")
        exit(1)
    
def replace_htm_from_template(template, filename, name):
    logging.info(f"Replacing {filename}.htm using {template}")

    with open(template, 'r') as tfile:
        tstring = tfile.read()

    tstring = tstring.replace("__FILENAME__", os.path.basename(filename))
    tstring = tstring.replace("__TITLE__", os.path.basename(name))

    with open(f"{filename}.htm", "w") as ofile:
        ofile.write(tstring)


def update_htm_from_template(template, filename, name):
    try:
        tstamp = os.path.getmtime(template)
    except:
        logging.info("Template not found")
        return
        
    try:
        if os.path.getmtime(f"{filename}.htm") > tstamp:
            return
    except FileNotFoundError:
        pass
    
    replace_htm_from_template(template, filename, name)

def resolve_vars(s, params, jt_vars, global_vars):
    if params is not None:
        for param, value in params.items():
            s = s.replace(f'${{{param}}}', value)
    if jt_vars is not None:
        for param, value in jt_vars.items():
            s = s.replace(f'${{{param}}}', value)
    if global_vars is not None:
        for param, value in global_vars.items():
            s = s.replace(f'${{{param}}}', value)

    return s


def run_job(job):
    logging.info(f'Running job {job["name"]}')

    jt = job.get("jobtype")

    if jt is not None:
        jobtype = config["jobtypes"][jt]
        tasks = jobtype["tasks"]
    else:
        tasks = job.get("tasks")

    if tasks is None:
        logger.warning("No tasks to run")    
        return

    global_vars = config.get("global_vars")
    jt_vars = jobtype.get("vars")
    params = job.get("params")

    if params is not None:
        if params.get("title") is None:
            params["title"] = job["name"]

    for task in tasks:
        logging.info(f'Running task {task["name"]}')

        command = task.get("command")
        shellcmd = task.get("shell")
        
        if command is not None: # Run the task command
            command = resolve_vars(command, params, jt_vars, global_vars)
            logging.info(command)
            process = subprocess.Popen(command.split(" "), stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            output, unused_err = process.communicate()
            retcode = process.poll()
            if retcode:
                logging.error(f"command failed : {output.decode('utf-8')}")
                return

        elif shellcmd is not None: # Run the task script
            shellcmd = resolve_vars(shellcmd, params, jt_vars, global_vars)       
            logging.info(shellcmd)
            process = subprocess.Popen("/bin/sh", stdout=subprocess.PIPE, stderr=subprocess.STDOUT, stdin=subprocess.PIPE)
            output, unused_err = process.communicate(shellcmd.encode())
            retcode = process.poll()
            if retcode:
                logging.error(f"command failed : {output.decode('utf-8')}")
                return

        else:
            logging.warning("Task has nothing to do")
            return
    

#    if jt_vars is not None:
#        template = jt_vars.get("template")
#        if template is not None:
#            update_htm_from_template(template, job["params"]["file"], job["name"])

#    if filename is not None:
#        update_htm_from_template(jobtype["template"], filename, job["name"])

def main():
    logformat = '%(asctime)s %(levelname)s : %(message)s'

    logconfig = {
        'format': logformat,
        'level': logging.INFO,
        'filename': 'task-runner.log'
    }

    logging.basicConfig(**logconfig)

    retrieve_config()

    try:
        for job in config["jobs"]:
            if job.get("enabled") != False:
                run_job(job)
    except KeyError as e:
        logging.info(f"Invalid configuration : {e}")
        exit(1)
#    except Exception as e:
#        logging.info(f"Other error : {e}")

if __name__ == '__main__':
    main()