#!/usr/bin/env node
import { exitOnError, login } from '../main.js';

login().catch(exitOnError);
