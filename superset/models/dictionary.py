import os
import json
from collections import OrderedDict
from flask_appbuilder import Model
from sqlalchemy import Table, Column, Integer, String, ForeignKey, Date, Float, Text
import sqlalchemy as sa
from flask_appbuilder.models.decorators import renders
from flask import Markup


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


class Product(Model):
    __tablename__ = 'product'
    id = Column(Integer, primary_key=True)
    cmc_id = Column(Text, unique=False, nullable=False)
    bi_name = Column(Text, unique=False, nullable=False)


class Customroles(Model):
    __tablename__ = 'customroles'
    id = Column(Integer, primary_key=True)
    product = Column(Text, unique=False, nullable=False)
    roles = Column(Text, unique=False, nullable=False)


class ErrorCode(Model):
    __tablename__ = 'errorcode'
    id = Column(Integer, primary_key=True)
    code = Column(Text, unique=False, nullable=False)
    description = Column(Text, unique=False, nullable=False)

    @renders('description')
    def my_description(self):
        # will render this columns as bold on ListWidget
        return Markup(
            '''<script>$("th:contains('Description')").css("width","75%");</script>'''
            + self.description)

    @renders('code')
    def my_code(self):
        # will render this columns as bold on ListWidget
        return Markup(
            '''<script>$("th:contains('ErrorCode')").css("width","15%");</script>'''
            + self.code)
