process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_EXPIRY = '3m'

require('dotenv').config()
const {expect} = require('chai');
const request = require('supertest');

global.expect = expect;
global.request = request;