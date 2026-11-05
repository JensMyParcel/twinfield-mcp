#!/usr/bin/env node
import { exitOnError, serveStdio } from '../main.js';

serveStdio().catch(exitOnError);
