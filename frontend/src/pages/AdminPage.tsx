import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useIsAdmin,
  useGetReports,
  useSuspendUser,
  useDeleteReportedContent,
} from '../hooks/useQueries';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  Trash2,
  UserX,
  Flag,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  FileText,
  MessageSquare,
} from 'lucide-react';
import type { Report } from '../types';

function getReasonLabel(reason: any): string {
  if (!reason) return 'Unknown';
  if (reason === 'spam' || (typeof reason === 'object' && 'spam' in reason)) return 'Spam';
  if (reason === 'misinformation' || (typeof reason === 'object' && 'misinformation' in reason))
    return 'Fake News / Misinformation';
  if (
    reason === 'inappropriateContent' ||
    (typeof reason === 'object' && 'inappropriateContent' in reason)
  )
    return 'Abusive Content';
  if (reason === 'harassment' || (typeof reason === 'object' && 'harassment' in reason))
    return 'Political Misinformation / Harassment';
  if (reason === 'other' || (typeof reason === 'object' && 'other' in reason)) return 'Other';
  return 'Unknown';
}

function getTargetTypeLabel(targetType: any): string {
  if (!targetType) return 'Unknown';
  if (targetType === 'post' || (typeof targetType === 'object' && 'post' in targetType))
    return 'Post';
  if (targetType === 'comment' || (typeof targetType === 'object' && 'comment' in targetType))
    return 'Comment';
  if (targetType === 'profile' || (typeof targetType === 'object' && 'profile' in targetType))
    return 'Profile';
  return 'Unknown';
}

function getStatusLabel(status: any): string {
  if (!status) return 'New';
  if (status === 'new' || (typeof status === 'object' && 'new' in status)) return 'New';
  if (status === 'reviewed' || (typeof status === 'object' && 'reviewed' in status))
    return 'Reviewed';
  if (status === 'resolved' || (typeof status === 'object' && 'resolved' in status))
    return 'Resolved';
  return 'New';
}

function isPostType(targetType: any): boolean {
  return (
    targetType === 'post' || (typeof targetType === 'object' && targetType !== null && 'post' in targetType)
  );
}

function isCommentType(targetType: any): boolean {
  return (
    targetType === 'comment' ||
    (typeof targetType === 'object' && targetType !== null && 'comment' in targetType)
  );
}

interface ReportCardProps {
  report: Report;
  onDeleteContent: (type: 'post' | 'comment', id: number) => void;
  onSuspendUser: (principal: string) => void;
  isDeleting: boolean;
  isSuspending: boolean;
}

function ReportCard({
  report,
  onDeleteContent,
  onSuspendUser,
  isDeleting,
  isSuspending,
}: ReportCardProps) {
  const targetTypeLabel = getTargetTypeLabel(report.targetType);
  const reasonLabel = getReasonLabel(report.reason);
  const statusLabel = getStatusLabel(report.status);
  const isPost = isPostType(report.targetType);
  const isComment = isCommentType(report.targetType);

  return (
    <Card className="mb-3">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                isPost ? 'bg-blue-100 dark:bg-blue-950' : 'bg-orange-100 dark:bg-orange-950'
              }`}
            >
              {isPost ? (
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <MessageSquare className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {targetTypeLabel} #{Number(report.targetId)}
                </Badge>
                <Badge
                  variant={statusLabel === 'New' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {statusLabel}
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground mt-1">{reasonLabel}</p>
              {report.details && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{report.details}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Reporter: {report.reporter.toString().slice(0, 16)}...
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(Number(report.timestamp) / 1_000_000).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {(isPost || isComment) && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  onDeleteContent(isPost ? 'post' : 'comment', Number(report.targetId))
                }
                disabled={isDeleting}
                className="h-8 text-xs gap-1"
              >
                {isDeleting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Delete
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSuspendUser(report.reporter.toString())}
              disabled={isSuspending}
              className="h-8 text-xs gap-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              {isSuspending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <UserX className="w-3 h-3" />
              )}
              Suspend
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: reports, isLoading: reportsLoading } = useGetReports();
  const suspendUser = useSuspendUser();
  const deleteContent = useDeleteReportedContent();

  const [suspendTarget, setSuspendTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'post' | 'comment';
    id: number;
  } | null>(null);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-8 pb-6">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Authentication Required
            </h2>
            <p className="text-sm text-muted-foreground">
              Please log in to access the admin panel.
            </p>
            <Button className="mt-4" onClick={() => navigate({ to: '/' })}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-8 pb-6">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              You do not have admin privileges to access this panel.
            </p>
            <Button className="mt-4" onClick={() => navigate({ to: '/' })}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allReports = reports ?? [];
  const postReports = allReports.filter((r) => isPostType(r.targetType));
  const commentReports = allReports.filter((r) => isCommentType(r.targetType));
  const profileReports = allReports.filter(
    (r) => !isPostType(r.targetType) && !isCommentType(r.targetType)
  );

  const handleDeleteContent = (type: 'post' | 'comment', id: number) => {
    setDeleteTarget({ type, id });
  };

  const handleSuspendUser = (principal: string) => {
    setSuspendTarget(principal);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteContent.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  };

  const confirmSuspend = async () => {
    if (!suspendTarget) return;
    await suspendUser.mutateAsync(suspendTarget);
    setSuspendTarget(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/' })}
            className="h-9 w-9 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {allReports.length} Reports
          </Badge>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card>
            <CardContent className="pt-3 pb-3 text-center">
              <p className="text-2xl font-bold text-foreground">{postReports.length}</p>
              <p className="text-xs text-muted-foreground">Post Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 pb-3 text-center">
              <p className="text-2xl font-bold text-foreground">{commentReports.length}</p>
              <p className="text-xs text-muted-foreground">Comment Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 pb-3 text-center">
              <p className="text-2xl font-bold text-foreground">{profileReports.length}</p>
              <p className="text-xs text-muted-foreground">Profile Reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">
              All ({allReports.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex-1">
              Posts ({postReports.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-1">
              Comments ({commentReports.length})
            </TabsTrigger>
          </TabsList>

          {reportsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="all">
                {allReports.length === 0 ? (
                  <div className="text-center py-12">
                    <Flag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No reports yet</p>
                  </div>
                ) : (
                  allReports.map((report) => (
                    <ReportCard
                      key={Number(report.id)}
                      report={report}
                      onDeleteContent={handleDeleteContent}
                      onSuspendUser={handleSuspendUser}
                      isDeleting={deleteContent.isPending}
                      isSuspending={suspendUser.isPending}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="posts">
                {postReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No post reports</p>
                  </div>
                ) : (
                  postReports.map((report) => (
                    <ReportCard
                      key={Number(report.id)}
                      report={report}
                      onDeleteContent={handleDeleteContent}
                      onSuspendUser={handleSuspendUser}
                      isDeleting={deleteContent.isPending}
                      isSuspending={suspendUser.isPending}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="comments">
                {commentReports.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No comment reports</p>
                  </div>
                ) : (
                  commentReports.map((report) => (
                    <ReportCard
                      key={Number(report.id)}
                      report={report}
                      onDeleteContent={handleDeleteContent}
                      onSuspendUser={handleSuspendUser}
                      isDeleting={deleteContent.isPending}
                      isSuspending={suspendUser.isPending}
                    />
                  ))
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reported Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteTarget?.type}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteContent.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation */}
      <AlertDialog
        open={!!suspendTarget}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend this user? They will not be able to create posts
              or comments.
              <br />
              <span className="font-mono text-xs mt-1 block">{suspendTarget}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {suspendUser.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Suspend User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
