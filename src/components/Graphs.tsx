'use client'

import React from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis,
    LineChart, Line
} from 'recharts'
import { RecommendationResult } from '@/lib/recommendation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface GraphsProps {
    data: RecommendationResult[]
}

export function Graphs({ data }: GraphsProps) {
    if (!data || data.length === 0) return null

    // Prep data for Weightage Chart
    const weightageData = data.map(d => ({
        name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
        weightage: Math.round(d.weightage * 100), // convert to % for easier reading
        frequency: d.frequency,
    }))

    // Prep data for ROI Scatter
    const scatterData = data.map(d => ({
        name: d.name,
        effort: Math.round(d.effortScore),
        marks: d.avgMarks,
        roi: d.roiScore
    }))

    // Prep data for Cumulative Marks
    let currentTotal = 0
    const cumulativeData = data.map((d, index) => {
        currentTotal += d.avgMarks
        return {
            step: `Ch ${index + 1}`,
            name: d.name,
            marks: currentTotal
        }
    })

    return (
        <div className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <Card>
                    <CardHeader>
                        <CardTitle>Cumulative Marks Progress</CardTitle>
                        <CardDescription>Expectation as you complete the recommended path</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cumulativeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="step" fontSize={12} />
                                <YAxis dataKey="marks" />
                                <Tooltip />
                                <Line type="monotone" dataKey="marks" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>ROI Scatter: Effort vs Marks</CardTitle>
                        <CardDescription>Top left is ideal (Low effort, High marks)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" dataKey="effort" name="Effort Score" unit="" domain={['dataMin - 1', 'dataMax + 1']} />
                                <YAxis type="number" dataKey="marks" name="Expected Marks" unit="" domain={[0, 'dataMax + 5']} />
                                <ZAxis type="number" dataKey="roi" range={[50, 400]} name="ROI" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Chapters" data={scatterData} fill="#16a34a" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Chapters Weightage Pattern</CardTitle>
                    <CardDescription>Comparing weightage (%) vs appearance frequency</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weightageData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="weightage" name="Weightage (%)" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="frequency" name="Frequency" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
