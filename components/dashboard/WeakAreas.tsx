import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Warning, TrendDown } from "@phosphor-icons/react/dist/ssr";

interface WeakArea {
  subtopic: string;
  score: number; // 0-100
  totalQuestions: number;
}

interface WeakAreasProps {
  weakAreas: WeakArea[];
}

export function WeakAreas({ weakAreas }: WeakAreasProps) {
  return (
    <Card className="h-full border-zinc-200 shadow-sm bg-white">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Warning weight="bold" className="w-5 h-5 text-red-500" />
                Weak Areas
            </CardTitle>
            <p className="text-sm text-zinc-500">
                Topics where you're performing below 60%.
            </p>
        </CardHeader>
        <CardContent>
            {weakAreas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                        <TrendDown weight="bold" className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-zinc-900 font-medium">No weak areas detected</p>
                    <p className="text-zinc-500 text-xs mt-1">Keep up the good work!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {weakAreas.map((area, i) => (
                        <div key={i} className="flex items-center justify-between group p-3 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-sm text-zinc-800">{area.subtopic}</span>
                                <span className="text-xs text-zinc-500">{area.totalQuestions} questions attempted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200 font-bold">
                                    {Math.round(area.score)}%
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
  )
}



