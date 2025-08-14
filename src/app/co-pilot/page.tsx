import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import TranslateForm from './translate-form'
import ReportForm from './report-form'
import DiscrepancyForm from './discrepancy-form'
import AnalysisForm from './analysis-form'

export default function CoPilotPage() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="translate" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="translate">Translate Terms</TabsTrigger>
          <TabsTrigger value="report">Generate Report</TabsTrigger>
          <TabsTrigger value="discrepancy">Explain Discrepancy</TabsTrigger>
          <TabsTrigger value="analysis">Root Cause Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="translate">
          <TranslateForm />
        </TabsContent>
        <TabsContent value="report">
          <ReportForm />
        </TabsContent>
        <TabsContent value="discrepancy">
          <DiscrepancyForm />
        </TabsContent>
        <TabsContent value="analysis">
          <AnalysisForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
