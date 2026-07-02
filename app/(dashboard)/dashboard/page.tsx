import { Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReviewsAreaChart } from "@/components/charts/reviews-area-chart";
import { RatingBarChart } from "@/components/charts/rating-bar-chart";
import { CampaignDonutChart } from "@/components/charts/campaign-donut-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStats, recentActivity } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your review performance and activity"
      >
        <Button variant="outline" size="sm">
          <Download className="size-4" />
          Export
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReviewsAreaChart />
        </div>
        <CampaignDonutChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RatingBarChart />
        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest events across your account</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
