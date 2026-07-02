import { Download, Plus, QrCode } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { qrCodes } from "@/lib/mock-data";

export default function QRCodesPage() {
  return (
    <>
      <PageHeader
        title="QR Codes"
        description="Create and track QR codes for review collection"
      >
        <Button size="sm">
          <Plus className="size-4" />
          Generate QR Code
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Scans", value: "3,033" },
          { label: "Conversions", value: "2,156" },
          { label: "Conversion Rate", value: "71.1%" },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm"
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <QrCode className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Scans</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrCodes.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell className="font-medium">{qr.name}</TableCell>
                    <TableCell>{qr.customer}</TableCell>
                    <TableCell className="text-right">{qr.scans.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {qr.conversions.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={qr.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{qr.created}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm">
                        <Download className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
