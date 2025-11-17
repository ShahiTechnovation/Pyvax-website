"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Code, 
  Zap, 
  Shield, 
  Cpu, 
  FileCode, 
  Terminal, 
  Rocket, 
  BookOpen,
  Sparkles,
  Database,
  Lock,
  TrendingUp,
  Layers,
  GitBranch,
  CheckCircle2,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function FeaturesContentNew() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <Badge className="mb-4">PyVax Features</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Everything You Need to Build on Avalanche
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          PyVax provides a complete toolkit for Python developers to create, deploy, and manage smart contracts on Avalanche C-Chain
        </p>
      </div>

      {/* Core Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Python Smart Contracts */}
        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Native Python Syntax</CardTitle>
            <CardDescription>
              Write smart contracts in pure Python without learning Solidity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Type hints support</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Decorators (@public, @view)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Familiar Python patterns</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No new language to learn</span>
            </div>
          </CardContent>
        </Card>

        {/* EVM Transpilation */}
        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Direct EVM Bytecode</CardTitle>
            <CardDescription>
              Python code transpiled directly to optimized EVM bytecode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No Solidity intermediate</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Optimized bytecode</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Smaller contract size</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Lower gas costs</span>
            </div>
          </CardContent>
        </Card>

        {/* Monaco Editor */}
        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FileCode className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Professional IDE</CardTitle>
            <CardDescription>
              Monaco Editor (VS Code engine) with full Python support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Syntax highlighting</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Auto-completion</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Error detection</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Multi-file support</span>
            </div>
          </CardContent>
        </Card>

        {/* MetaMask Integration */}
        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Secure Wallet Integration</CardTitle>
            <CardDescription>
              Seamless MetaMask integration for safe transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>One-click connection</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Transaction signing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Network switching</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Balance tracking</span>
            </div>
          </CardContent>
        </Card>

        {/* Avalanche Optimized */}
        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Avalanche Optimized</CardTitle>
            <CardDescription>
              Built specifically for Avalanche C-Chain performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Mainnet support</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Fuji testnet</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Fast finality</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Low transaction fees</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant */}
        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>ElizaOS AI Agent</CardTitle>
            <CardDescription>
              AI-powered assistant for smart contract development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Code auditing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Security suggestions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Gas optimization</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Deployment guidance</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Features */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Advanced Capabilities</h2>
          <p className="text-muted-foreground">
            Professional tools for serious developers
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* File System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                IndexedDB File System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Browser-based file storage for your contracts and projects
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Save and load contracts locally</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Project organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Version history</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Import/Export functionality</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Real-time Compilation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Real-time Compilation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Instant feedback on your code with live compilation
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Instant error detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>ABI generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Bytecode optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Gas estimation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contract Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Contract Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Pre-built templates for common contract patterns
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>ERC20 tokens</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>ERC721 NFTs</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>DeFi protocols</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>DAO governance</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Deployment Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                One-Click Deployment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Deploy contracts to Avalanche with a single click
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Automatic gas estimation</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Transaction tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Snowtrace verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Deployment history</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Developer Experience */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Developer Experience</CardTitle>
          <CardDescription>Built by developers, for developers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Terminal className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">Zero Setup</h3>
              <p className="text-sm text-muted-foreground">
                No installation required. Open your browser and start coding immediately.
              </p>
            </div>
            
            <div className="space-y-2">
              <BookOpen className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">Comprehensive Docs</h3>
              <p className="text-sm text-muted-foreground">
                Detailed documentation with examples, tutorials, and API references.
              </p>
            </div>
            
            <div className="space-y-2">
              <GitBranch className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">Open Source</h3>
              <p className="text-sm text-muted-foreground">
                Fully open-source codebase. Contribute and customize as needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Performance Metrics</h2>
          <p className="text-muted-foreground">
            Fast, efficient, and optimized for production
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">&lt; 2s</CardTitle>
              <CardDescription>Initial Load Time</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">&lt; 100ms</CardTitle>
              <CardDescription>Transpilation Speed</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">33%</CardTitle>
              <CardDescription>Smaller Bytecode</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">92%</CardTitle>
              <CardDescription>Bundle Size Reduction</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
        <CardContent className="p-8 text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to Build on Avalanche?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Start writing Python smart contracts today. No installation, no setup, just code.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/playground">
              <Button size="lg" variant="secondary" className="gap-2">
                <Rocket className="w-5 h-5" />
                Launch Playground
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <BookOpen className="w-5 h-5" />
                Read Documentation
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
