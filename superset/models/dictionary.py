import os
import json
from collections import OrderedDict
from flask_appbuilder import Model
from sqlalchemy import Table, Column, Integer, String, ForeignKey, Date, Float, Text
import sqlalchemy as sa


class IRT(Model):
    __tablename__ = "iRT"
    id = Column(Integer, primary_key=True)
    field_name = Column(Text, unique=False, nullable=False)
    describe = Column(Text, unique=False, nullable=False)


class GreenT(Model):
    __tablename__ = 'GreenT'
    id = Column(Integer, primary_key=True)
    field_name = Column(Text, unique=False, nullable=False)
    describe = Column(Text, unique=False, nullable=False)


class DSED(Model):
    __tablename__ = 'DSED'
    id = Column(Integer, primary_key=True)
    field_name = Column(Text, unique=False, nullable=False)
    describe = Column(Text, unique=False, nullable=False)


class DSE(Model):
    __tablename__ = 'DSE'
    id = Column(Integer, primary_key=True)
    field_name = Column(Text, unique=False, nullable=False)
    describe = Column(Text, unique=False, nullable=False)


class Company(Model):
    __tablename__ = 'company'
    id = Column(Integer, primary_key=True)
    field_name = Column(Text, unique=False, nullable=False)
