import { MessageCircle, Plus, Send } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { whatsappMessages } from "@/lib/mock-data";

export default function WhatsAppPage() {
  return (
    <>
      <PageHeader
        title="WhatsApp"
        description="Send review requests and manage WhatsApp conversations"
      >
        <Button size="sm">
          <Plus className="size-4" />
          New Message
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Contact</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whatsappMessages.map((msg) => (
                      <TableRow key={msg.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{msg.contact}</p>
                            <p className="text-xs text-muted-foreground">{msg.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{msg.customer}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {msg.message}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={msg.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">{msg.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <MessageCircle className="size-4 text-emerald-500" />
              Quick Send
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compose a review request message
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Hi! Thank you for visiting us. We'd love to hear about your experience..."
              className="min-h-[120px] resize-none"
            />
            <Button className="w-full">
              <Send className="size-4" />
              Send Message
            </Button>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs font-medium">Delivery Stats</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold">98.2%</p>
                  <p className="text-[10px] text-muted-foreground">Delivered</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">76.4%</p>
                  <p className="text-[10px] text-muted-foreground">Read</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">34.1%</p>
                  <p className="text-[10px] text-muted-foreground">Responded</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
