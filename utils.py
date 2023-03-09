import yaml
import json
import logging
import os
import shutil

from project_generator import templates

def run_log():
    logging.basicConfig(format='%(asctime)s - %(name)s - [%(levelname)s]: %(message)s', datefmt='[%Y-%m-%d %H:%M:%S]')
    log = logging.getLogger()
    log.setLevel(logging.INFO)
    return log
def generate_template_yaml(argv):
    if len(argv) == 3:
        template = str(argv[2]).lower()
    else:
        shutil.copy(templates.demo, './config.yaml')
        return
    if template == 'fastapi':
        shutil.copy(templates.fastapi, './config.yaml')
    else:
        shutil.copy(templates.demo, './config.yaml')
# def generate_template_yaml():
#     template = [
#         {
#             "name": "projectname", # name of folder.
#             "islib": True, # Optional, default to True.
#             "children":[ # Optional, default []
#                 {
#                     "name": "docs",
#                     "islib": False,
#                 },
#                 {
#                     "name": "test",
#                     "islib":False,
#                     "children":[
#                         {
#                             "name":"scripts",
#                             "child":[
#                                 {
#                                     "name":"migration",
#                                 },
#                             ],
#                         },
#                     ],
#                 },
#             ],
#             "docs":['main.py', 'README']
#         },
#     ]
#     with open('config.yaml', 'w', encoding='utf8') as f:
#         yaml.dump(template, f, sort_keys=False)

def parse_conf(path:str):
    with open(path, 'r', encoding='utf8') as f:
        if path.lower().endswith('yaml') or path.lower().endswith('yml'):
            res = yaml.load(f)
        elif path.lower().endswith('json'):
            res = json.load(f)
    return res

def create_init_py(path):
    with open(os.path.join(path,'__init__.py'), 'w', encoding='utf8') as f:
        f.write('')