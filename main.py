import argparse
import os
import logging
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
import yaml
from pathlib import Path

from project_generator.utils import *
from project_generator.errors import * 

def run():
    parser = argparse.ArgumentParser(description='see help or use ```python main.py init``` to see a demo config')
    parser.add_argument('--target', help='The location of folder to create folder',required=True)
    parser.add_argument('--config', help='The path of config', default='config.yaml')
    args = parser.parse_args()
    folder_structure = parse_conf(path=os.path.realpath(args.config))

    target = os.path.realpath(args.target)
    # if os.path.exists(target) and os.path.isdir(target): 
    if 1: 
        # print("The operation will change the existed folder and cannot be undo. Continue? [y/N]")
        # check = None if input().upper()!='Y' else 'Y'
        check = True
        if check: 
            def _exec(fs, parent=''):
                for folder in fs:
                    if not parent: 
                        _fn = os.path.join(target, folder['name'])
                    else:
                        _fn = os.path.join(parent, folder['name'])

                    os.makedirs(_fn)
                    if 'docs' in folder.keys():
                        for i in folder['docs']:
                            Path(os.path.join(_fn, i)).touch()
                    print(f'{os.path.relpath(_fn)}: created')
                    if 'islib' in folder.keys():
                        if folder['islib']:
                            create_init_py(_fn)
                    else:
                        create_init_py(_fn)
                    
                    if 'children' in folder.keys():
                        _exec(folder['children'], parent=_fn)

            _exec(folder_structure)

        else:
            return
  

def main():
    if len(sys.argv) == 1:
        print("""Use \n\t```python main.py init``` to initialize a demo config or \n\t```python main.py --help``` to see usage.""")
        return
    if str(sys.argv[1]).lower() == 'init':
        generate_template_yaml(sys.argv)
        return
    else:
        run()

if __name__ == '__main__':
    main()