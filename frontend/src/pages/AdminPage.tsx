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

function ReportCard({ report, onDeleteContent, onSuspendUser, isDeleting, isSuspending }: ReportCardProps) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-destructive flex-shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              {getTargetTypeLabel(report.targetType)} Report
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {getStatusLabel(report.status)}
          </Badge>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground mb-3">
          <p>
            <span className="font-medium">Reason:</span> {getReasonLabel(report.reason)}
          </p>
          <p>
            <span className="font-medium">Target ID:</span> {Number(report.targetId)}
          </p>
          {report.details && (
            <p>
              <span className="font-medium">Details:</span> {report.details}
            </p>
          )}
          <p>
            <span className="font-medium">Reporter:</span>{' '}
            {report.reporter.toString().slice(0, 16)}...
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {isPostType(report.targetType) && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeleteContent('post', Number(report.targetId))}
              disabled={isDeleting}
              className="h-8 text-xs gap-1"
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Delete Post
            </Button>
          )}
          {isCommentType(report.targetType) && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeleteContent('comment', Number(report.targetId))}
              disabled={isDeleting}
              className="h-8 text-xs gap-1"
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
              Delete Comment
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSuspendUser(report.reporter.toString())}
            disabled={isSuspending}
            className="h-8 text-xs gap-1 border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            {isSuspending ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
            Suspend User
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: reports = [], isLoading: reportsLoading } = useGetReports();
  const deleteContent = useDeleteReportedContent();
  const suspendUser = useSuspendUser();

  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'suspend';
    id?: number;
    contentType?: 'post' | 'comment';
    principal?: string;
  } | null>(null);

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <p className="text-muted-foreground text-center">Please log in to access the admin panel.</p>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <AlertTriangle className="w-16 h-16 text-destructive" />
        <p className="text-foreground font-semibold text-center">Access Denied</p>
        <p className="text-muted-foreground text-sm text-center">
          You do not have admin privileges.
        </p>
        <Button onClick={() => navigate({ to: '/' })}>Go Home</Button>
      </div>
    );
  }

  const handleDeleteContent = (type: 'post' | 'comment', id: number) => {
    setConfirmAction({ type: 'delete', id, contentType: type });
  };

  const handleSuspendUser = (principal: string) => {
    setConfirmAction({ type: 'suspend', principal });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'delete' && confirmAction.id !== undefined) {
        await deleteContent.mutateAsync(BigInt(confirmAction.id));
      } else if (confirmAction.type === 'suspend' && confirmAction.principal) {
        await suspendUser.mutateAsync(confirmAction.principal);
      }
    } catch {
      // handled by mutation
    }
    setConfirmAction(null);
  };

  const postReports = (reports as Report[]).filter((r) => isPostType(r.targetType));
  const commentReports = (reports as Report[]).filter((r) => isCommentType(r.targetType));
  const profileReports = (reports as Report[]).filter(
    (r) => !isPostType(r.targetType) && !isCommentType(r.targetType)
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{(reports as Report[]).length}</p>
            <p className="text-xs text-muted-foreground">Total Reports</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{postReports.length}</p>
            <p className="text-xs text-muted-foreground">Post Reports</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{commentReports.length}</p>
            <p className="text-xs text-muted-foreground">Comment Reports</p>
          </div>
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="posts" className="flex-1">
              <FileText className="w-3.5 h-3.5 mr-1" />
              Posts ({postReports.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-1">
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              Comments ({commentReports.length})
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex-1">
              <Flag className="w-3.5 h-3.5 mr-1" />
              Other ({profileReports.length})
            </TabsTrigger>
          </TabsList>

          {reportsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="posts">
                {postReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No post reports
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
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No comment reports
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

              <TabsContent value="profiles">
                {profileReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No other reports
                  </div>
                ) : (
                  profileReports.map((report) => (
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

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'delete' ? 'Delete Content' : 'Suspend User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'delete'
                ? `Are you sure you want to delete this ${confirmAction.contentType}? This action cannot be undone.`
                : 'Are you sure you want to suspend this user? They will lose access to the platform.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteContent.isPending || suspendUser.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : confirmAction?.type === 'delete' ? (
                'Delete'
              ) : (
                'Suspend'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
