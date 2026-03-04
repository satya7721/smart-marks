'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Target, BookOpen, Clock, Zap, ArrowRight, Download, Mail, RefreshCw, LogIn } from 'lucide-react';

import { getChaptersAndStats } from '@/lib/actions';
import { generateRecommendations, RecommendationResult, StudentLevel, RecommendationMode } from '@/lib/recommendation';
import { Graphs } from './Graphs';

type Step = 'LANDING' | 'SETUP' | 'RESULTS';

interface Props {
    initialExams: { id: string, name: string }[];
    initialSubjects: { id: string, exam_id: string, name: string }[];
}

export function SmartMarksFlow({ initialExams, initialSubjects }: Props) {
    const [step, setStep] = useState<Step>('LANDING');

    // Form State
    const [examId, setExamId] = useState<string>('');
    const [subjectId, setSubjectId] = useState<string>('');
    const [targetMax, setTargetMax] = useState<number>(30);
    const [availableHours, setAvailableHours] = useState<number | ''>('');
    const [level, setLevel] = useState<StudentLevel>('intermediate');
    const [mode, setMode] = useState<RecommendationMode>('maxROI');

    // Results State
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<RecommendationResult[]>([]);

    // Auth/Export State
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [exportTarget, setExportTarget] = useState<'PDF' | 'EMAIL' | null>(null);

    const filteredSubjects = initialSubjects.filter(s => s.exam_id === examId);

    const handleGenerate = async () => {
        if (!subjectId) return;
        setLoading(true);

        try {
            const chapters = await getChaptersAndStats(subjectId);
            const output = generateRecommendations(
                chapters,
                0, // targetMin not really used yet
                targetMax,
                availableHours === '' ? null : availableHours,
                level,
                mode
            );
            setResults(output);
            setStep('RESULTS');
        } catch (e) {
            console.error(e);
            alert('Failed to generate recommendations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportClick = (type: 'PDF' | 'EMAIL') => {
        // In Beta, Guest users get gated.
        setExportTarget(type);
        setIsAuthDialogOpen(true);
    };

    const executeExport = () => {
        setIsAuthDialogOpen(false);
        alert(`${exportTarget} generation request accepted!`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <header className="px-6 py-4 bg-white border-b sticky top-0 z-10 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <Zap size={20} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Smart Marks</h1>
                </div>
                {step !== 'LANDING' && (
                    <Button variant="ghost" size="sm" onClick={() => setStep('LANDING')}>
                        Start Over
                    </Button>
                )}
            </header>

            <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8">

                {/* LANDING PAGE */}
                {step === 'LANDING' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in duration-500">
                        <Badge variant="secondary" className="px-3 py-1 rounded-full text-sm font-medium">✨ Beta Version (Guest Access)</Badge>
                        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                            Minimum Study, <br className="hidden md:block" />
                            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Maximum Marks.</span>
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Stop guessing what to study. Enter your target marks, and our data-driven engine will generate your personalized high-ROI study path based on historical paper weightage and frequency.
                        </p>
                        <Button size="lg" className="rounded-full h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" onClick={() => setStep('SETUP')}>
                            Generate My Plan <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                )}

                {/* SETUP FLOW */}
                {step === 'SETUP' && (
                    <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
                        <Card className="shadow-xl bg-white border-slate-200">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl font-bold">Configure Your Target</CardTitle>
                                <CardDescription>Tell us what you want to achieve.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">

                                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2"><BookOpen size={16} /> Select Exam</label>
                                        <Select value={examId} onValueChange={(val) => { setExamId(val); setSubjectId(''); }}>
                                            <SelectTrigger><SelectValue placeholder="Choose an exam" /></SelectTrigger>
                                            <SelectContent>
                                                {initialExams.map(ex => <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2"><BookOpen size={16} /> Select Subject</label>
                                        <Select value={subjectId} onValueChange={setSubjectId} disabled={!examId}>
                                            <SelectTrigger><SelectValue placeholder="Choose a subject" /></SelectTrigger>
                                            <SelectContent>
                                                {filteredSubjects.map(sub => <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2"><Target size={16} /> Target Expected Marks</label>
                                    <Input type="number" value={targetMax} onChange={e => setTargetMax(Number(e.target.value))} placeholder="e.g. 30" className="text-lg font-medium" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><Clock size={16} /> Max Hours (Optional)</label>
                                        <Input type="number" value={availableHours} onChange={e => setAvailableHours(e.target.value ? Number(e.target.value) : '')} placeholder="Limit time" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600">Your Base Level</label>
                                        <Select value={level} onValueChange={(val) => setLevel(val as StudentLevel)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="strong">Strong</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t">
                                    <label className="text-sm font-medium text-slate-600">Strategy Priority</label>
                                    <Tabs value={mode} onValueChange={(v) => setMode(v as RecommendationMode)} className="w-full">
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="maxROI">Max ROI</TabsTrigger>
                                            <TabsTrigger value="balanced">Balanced</TabsTrigger>
                                            <TabsTrigger value="targetFirst">Marks 1st</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button className="w-full h-12 text-md" size="lg" disabled={!subjectId || loading} onClick={handleGenerate}>
                                    {loading ? <RefreshCw className="mr-2 animate-spin w-5 h-5" /> : <Zap className="mr-2 w-5 h-5" />}
                                    {loading ? 'Crunching data...' : 'Generate Action Plan'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* RESULTS DASHBOARD */}
                {step === 'RESULTS' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">Your High-ROI Study Plan <Badge className="bg-green-100 text-green-800 hover:bg-green-200 ml-2">Beta</Badge></h2>
                                <p className="text-slate-500 mt-1">
                                    Target: <strong className="text-slate-800">{targetMax} marks</strong> • Profile: <strong className="text-slate-800 capitalize">{level}</strong> • Strategy: <strong className="text-slate-800 capitalize">{mode}</strong>
                                </p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button variant="outline" className="flex-1 md:flex-none border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100" onClick={() => handleExportClick('PDF')}>
                                    <Download className="mr-2 w-4 h-4" /> PDF
                                </Button>
                                <Button variant="outline" className="flex-1 md:flex-none" onClick={() => handleExportClick('EMAIL')}>
                                    <Mail className="mr-2 w-4 h-4" /> Email
                                </Button>
                                <Button variant="default" onClick={() => setStep('SETUP')} className="flex-1 md:flex-none" title="Refine Filters">
                                    Refine
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue="list" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6">
                                <TabsTrigger value="list">Ranked List</TabsTrigger>
                                <TabsTrigger value="graphs">Visual Insights</TabsTrigger>
                            </TabsList>

                            <TabsContent value="list" className="space-y-4">
                                <Card>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead className="w-16 text-center">Rank</TableHead>
                                                    <TableHead>Chapter Name</TableHead>
                                                    <TableHead className="text-center">Expected Marks</TableHead>
                                                    <TableHead className="hidden md:table-cell">Difficulty</TableHead>
                                                    <TableHead className="hidden md:table-cell text-right">Est. Hours</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {results.length === 0 ? (
                                                    <TableRow><TableCell colSpan={6} className="text-center h-24 text-slate-500">No chapters matched your criteria or none available.</TableCell></TableRow>
                                                ) : (
                                                    results.map((chap, idx) => (
                                                        <TableRow key={chap.id} className="hover:bg-slate-50 transition-colors">
                                                            <TableCell className="text-center font-bold text-slate-400">#{idx + 1}</TableCell>
                                                            <TableCell>
                                                                <div className="font-semibold text-slate-900">{chap.name}</div>
                                                                <div className="text-xs text-slate-500 mt-1">{chap.reason}</div>
                                                            </TableCell>
                                                            <TableCell className="text-center font-mono">
                                                                <Badge variant="secondary" className="bg-primary/10 text-primary">{chap.avgMarks.toFixed(1)}</Badge>
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                <div className="flex gap-1">
                                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                                        <div key={i} className={`w-2 h-2 rounded-full ${i < chap.difficulty ? 'bg-orange-400' : 'bg-slate-200'}`} />
                                                                    ))}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell text-right font-medium text-slate-600">
                                                                {chap.estimatedHours}h
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="sm" className="text-primary font-medium hover:text-primary hover:bg-primary/10">Select</Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                                {/* Summary Footer */}
                                                {results.length > 0 && (
                                                    <TableRow className="bg-slate-900 text-white hover:bg-slate-900">
                                                        <TableCell colSpan={2} className="font-bold border-none rounded-bl-lg">Total Expectation</TableCell>
                                                        <TableCell className="text-center font-mono font-bold border-none text-green-400">
                                                            ~{results.reduce((s, c) => s + c.avgMarks, 0).toFixed(1)} marks
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell border-none"></TableCell>
                                                        <TableCell className="hidden md:table-cell text-right font-bold border-none text-blue-300">
                                                            {results.reduce((s, c) => s + c.estimatedHours, 0)}h
                                                        </TableCell>
                                                        <TableCell className="border-none rounded-br-lg"></TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="graphs">
                                <Graphs data={results} />
                            </TabsContent>
                        </Tabs>

                    </div>
                )}

            </main>

            {/* LOGIN/EXPORT GATE DIALOG */}
            <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Sign in required</DialogTitle>
                        <DialogDescription>
                            To export your study plan via <strong>{exportTarget}</strong>, you need to sign in or create a free account.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                            <Input id="email" type="email" placeholder="you@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <Input id="password" type="password" />
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setIsAuthDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                        <Button onClick={executeExport} className="w-full sm:w-auto">
                            <LogIn className="mr-2 w-4 h-4" /> Sign In & Export
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
