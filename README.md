# project_generator
A tool for quick generate a project structure
## Quick Starting
- Clone the project.  
```bash
git clone https://github.com/thisishugow/project_generator.git
```  
- Usage  
  - Directly use it without installation.
  ```bash
  cd project_generator
  python project_generator/main.py init demo # use init to create an example config.
  python project_generator/main.py --target . --config config.yaml
  ```  
  - Install it and execute directly from CLI. 
  ```bash
  pip install project_generator/dist/project_generator-0.0.0b0-py3-none-any.whl
  project-generator init fastapi # create an example config of fastapi project.
  project-generator --target . # --config is optional and has a default=config.yaml
  ```
## Configuration  
Example:  
```yaml
- name: projectname
  islib: true
  children:
  - name: docs
    islib: false
  - name: test
    islib: false
    children:
    - name: scripts
      child:
      - name: migration
  docs:
  - main.py
  ```  
  - `name`: str, name of the folder    
  - `islib`: bool, default=true, set true to create `__init__.py` while folder created.   
  - `children`: list, default=[], a set of the sub-folders' config.   
  - `docs`: list, default=[], a set of blank files, which will be created with the folders.   
  > Config in json is supported as well.  
