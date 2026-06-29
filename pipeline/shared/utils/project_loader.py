"""
Project Loader Utility
Loads and manages project configurations
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional


class ProjectLoader:
    """Loads and manages project configurations"""
    
    def __init__(self, projects_dir: str = "projects"):
        """
        Initialize project loader
        
        Args:
            projects_dir: Directory containing project folders
        """
        self.projects_dir = Path(projects_dir)
        self._projects = {}
    
    def load_project(self, project_id: str) -> Dict[str, Any]:
        """
        Load project configuration
        
        Args:
            project_id: ID of the project to load (e.g., 'gambia', 'benin')
            
        Returns:
            Dictionary containing project configuration
        """
        if project_id in self._projects:
            return self._projects[project_id]
        
        config_path = self.projects_dir / project_id / "config" / "project_config.json"
        
        if not config_path.exists():
            raise ValueError(f"Project config not found: {config_path}")
        
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        self._projects[project_id] = config
        return config
    
    def list_projects(self) -> list:
        """
        List all available projects
        
        Returns:
            List of project IDs
        """
        if not self.projects_dir.exists():
            return []
        
        return [
            d.name 
            for d in self.projects_dir.iterdir() 
            if d.is_dir() and (d / "config" / "project_config.json").exists()
        ]
    
    def get_project_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """
        Find project by slug (e.g., 'gambia-itc')
        
        Args:
            slug: Project slug
            
        Returns:
            Project configuration or None
        """
        for project_id in self.list_projects():
            config = self.load_project(project_id)
            if config["project"]["slug"] == slug:
                return config
        
        return None


def get_project_path(project_id: str, relative_path: str) -> Path:
    """
    Get absolute path for a project file
    
    Args:
        project_id: Project ID
        relative_path: Path relative to project directory
        
    Returns:
        Absolute path to the file
    """
    return Path("projects") / project_id / relative_path


def load_project_data(project_id: str, data_type: str) -> Dict[str, Any]:
    """
    Load project data file
    
    Args:
        project_id: Project ID
        data_type: Type of data to load (from project config data sources)
        
    Returns:
        Data from the file
    """
    loader = ProjectLoader()
    config = loader.load_project(project_id)
    
    data_sources = config["project"]["data"]["sources"]
    
    if data_type not in data_sources:
        raise ValueError(f"Unknown data type: {data_type}")
    
    file_path = Path(data_sources[data_type])
    
    if not file_path.exists():
        raise FileNotFoundError(f"Data file not found: {file_path}")
    
    with open(file_path, 'r') as f:
        return json.load(f)

