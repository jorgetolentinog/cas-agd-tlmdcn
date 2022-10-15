import { startDb, stopDb, createTables, deleteTables } from 'jest-dynalite'

beforeAll(startDb)
beforeEach(createTables)
afterEach(deleteTables)
afterAll(stopDb)
