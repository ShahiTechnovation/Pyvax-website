'use client'

/**
 * Verification Test Page
 * Test and debug contract verification system
 */

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { verificationDB } from '@/lib/verification/database'
import { CheckCircle2, XCircle, AlertCircle, Database, Trash2 } from 'lucide-react'

export default function TestVerificationPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      setLoading(true)
      const allContracts = await verificationDB.getAllContracts()
      const dbStats = await verificationDB.getStats()
      setContracts(allContracts)
      setStats(dbStats)
    } catch (error: any) {
      console.error('Load error:', error)
      setTestResult(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testVerification = async () => {
    try {
      setTestResult('🔍 Testing verification API...')
      
      const testAddress = '0x' + '1234567890'.repeat(4)
      
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: testAddress,
          network: 'fuji',
          pythonSource: `class TestContract:
    def __init__(self):
        self.owner = msg.sender
    
    def get_owner(self):
        return self.owner`,
          contractName: 'TestContract',
          compilerVersion: 'test-1.0.0'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setTestResult(`✅ Success! ${result.message}`)
        await loadContracts()
      } else {
        setTestResult(`⚠️ ${result.message}`)
      }
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`)
    }
  }

  const clearDatabase = async () => {
    if (confirm('Are you sure you want to clear all verified contracts?')) {
      try {
        for (const contract of contracts) {
          await verificationDB.deleteContract(contract.id)
        }
        setTestResult('✅ Database cleared!')
        await loadContracts()
      } catch (error: any) {
        setTestResult(`❌ Error: ${error.message}`)
      }
    }
  }

  const deleteContract = async (id: string) => {
    try {
      await verificationDB.deleteContract(id)
      setTestResult('✅ Contract deleted!')
      await loadContracts()
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Verification System Test
          </h1>
          <p className="text-slate-400">Test and debug the contract verification database</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-slate-900/50 border-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Total Contracts</p>
                  <p className="text-2xl font-bold">{stats.totalContracts}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-xs text-slate-400">Verified</p>
                  <p className="text-2xl font-bold">{stats.verifiedCount}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-xs text-slate-400">Unverified</p>
                  <p className="text-2xl font-bold">{stats.unverifiedCount}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Actions */}
        <Card className="bg-slate-900/50 border-slate-700/50 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={loadContracts}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Database className="w-4 h-4 mr-2" />
              Reload Contracts
            </Button>
            <Button
              onClick={testVerification}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Test Verification
            </Button>
            <Button
              onClick={clearDatabase}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Database
            </Button>
          </div>

          {testResult && (
            <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-700">
              <p className="text-sm font-mono">{testResult}</p>
            </div>
          )}
        </Card>

        {/* Contracts List */}
        <Card className="bg-slate-900/50 border-slate-700/50 p-6">
          <h2 className="text-xl font-bold mb-4">Verified Contracts</h2>

          {loading ? (
            <div className="text-center py-8 text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading...
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Database className="w-16 h-16 text-slate-600 mx-auto mb-2" />
              <p>No contracts in database</p>
              <p className="text-sm">Deploy a contract from the IDE to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract, idx) => (
                <Card key={idx} className="bg-slate-950 border-slate-700 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-blue-400">
                          {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                        </span>
                        {contract.verified ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Contract:</span>
                          <span className="ml-2 text-white">{contract.contractName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Network:</span>
                          <span className="ml-2 text-white">{contract.network}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Compiler:</span>
                          <span className="ml-2 text-white">{contract.compilerVersion}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">ABI Length:</span>
                          <span className="ml-2 text-white">{contract.abi?.length || 0} functions</span>
                        </div>
                      </div>

                      {contract.pythonSource && (
                        <details className="mt-2">
                          <summary className="text-xs text-slate-400 cursor-pointer hover:text-white">
                            View Python Source
                          </summary>
                          <pre className="mt-2 p-2 bg-slate-900 rounded text-xs overflow-auto max-h-40">
                            <code className="text-green-400">{contract.pythonSource}</code>
                          </pre>
                        </details>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`/explorer/${contract.address}?network=${contract.network}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline" className="bg-slate-800">
                          View
                        </Button>
                      </a>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteContract(contract.id)}
                        className="bg-red-900/20 border-red-500/30 hover:bg-red-900/40"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Debug Info */}
        <Card className="bg-slate-900/50 border-slate-700/50 p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <span className="text-slate-400">IndexedDB Support:</span>
              <span className="ml-2 text-white">
                {typeof window !== 'undefined' && window.indexedDB ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Database Name:</span>
              <span className="ml-2 text-white">pyvax-verification</span>
            </div>
            <div>
              <span className="text-slate-400">API Endpoint:</span>
              <span className="ml-2 text-white">/api/verify</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
