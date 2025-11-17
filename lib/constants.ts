// Global constants for PyVax Unified

// WebContainer configuration
export const WORK_DIR_NAME = 'project'
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// AI Configuration
export const DEFAULT_PROVIDER = 'openai'
export const DEFAULT_MODEL = 'gpt-4o-mini'
export const MAX_TOKENS = 8000
export const MAX_RESPONSE_SEGMENTS = 5

// LLM Providers
export const PROVIDER_LIST = [
  'openai',
  'anthropic',
  'google',
  'mistral',
  'cohere',
  'openrouter',
  'groq',
] as const

export type Provider = (typeof PROVIDER_LIST)[number]

// Model Regex for parsing
export const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/
export const PROVIDER_REGEX = /\[Provider: (.*?)\]/

// File system
export const IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.next/**',
  '*.log',
]

// Terminal
export const TERMINAL_ROWS = 30
export const TERMINAL_COLS = 100

// Preview
export const PREVIEW_TIMEOUT = 30000 // 30 seconds

// Web3
export const AVALANCHE_MAINNET = {
  chainId: 43114,
  name: 'Avalanche C-Chain',
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  blockExplorer: 'https://snowtrace.io',
}

export const AVALANCHE_FUJI = {
  chainId: 43113,
  name: 'Avalanche Fuji Testnet',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  blockExplorer: 'https://testnet.snowtrace.io',
}

// System prompts
export const MODIFICATIONS_TAG_NAME = 'bolt_file_modifications'
export const WORK_DIR = `/home/${WORK_DIR_NAME}`
