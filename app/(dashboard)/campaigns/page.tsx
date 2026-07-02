import { Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { campaigns } from "@/lib/mock-data";

export default function CampaignsPage() {
  const activeCampaigns = campaigns.filter((c) => c.status === "active");

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Launch and monitor review request campaigns"
      >
        <Button size="sm">
          <Plus className="size-4" />
          New Campaign
        </Button>
      </PageHeader>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <CampaignTable data={campaigns} />
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          <CampaignTable data={activeCampaigns} />
        </TabsContent>
        <TabsContent value="scheduled" className="mt-6">
          <CampaignTable data={campaigns.filter((c) => c.status === "scheduled")} />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <CampaignTable data={campaigns.filter((c) => c.status === "completed")} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function CampaignTable({ data }: { data: typeof campaigns }) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Campaign</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Responses</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.customer}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {campaign.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.sent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.responses.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">{campaign.rate}</TableCell>
                  <TableCell>
                    <StatusBadge status={campaign.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {campaign.startDate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
