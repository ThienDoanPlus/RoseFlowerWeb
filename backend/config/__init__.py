"""
Config package for Rose Flowers Django REST Framework backend.
"""

try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass
