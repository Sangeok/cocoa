"use client";

import { useUserDetail } from "@/lib/hooks/use-user-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useParams } from "next/navigation";
import { useMessages } from "@/lib/hooks/use-messages";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { For } from "react-haiku";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: user, isLoading: isUserLoading } = useUserDetail(id);
  const { messages, isLoading: isMessagesLoading, createMessage } = useMessages(parseInt(id));
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<typeof messages[0] | null>(null);

  const handleSendMessage = async () => {
    if (!title || !content) return;
    
    setIsLoading(true);
    try {
      const response = await createMessage.mutateAsync({
        userId: parseInt(id),
        title,
        content,
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      setIsOpen(false);
      setTitle("");
      setContent("");
      toast.success("메시지를 전송했습니다");
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "메시지 전송에 실패했습니다";
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">사용자 상세</h1>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              메시지 보내기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>메시지 보내기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Input
                  placeholder="제목"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="내용"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!title || !content || isLoading}
                >
                  {isLoading ? "전송 중..." : "보내기"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 사용자 정보 */}
      {isUserLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      ) : user ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">이름</h3>
            <p>{user.name}</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">
              이메일
            </h3>
            <p>{user.email}</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">
              로그인 방식
            </h3>
            <p>{user.provider}</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">
              가입일
            </h3>
            <p>{format(new Date(user.createdAt), "PPP", { locale: ko })}</p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">사용자를 찾을 수 없습니다.</p>
      )}

      {/* 메시지 목록 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">메시지 기록</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>내용</TableHead>
                <TableHead className="w-[100px]">상태</TableHead>
                <TableHead className="w-[180px]">보낸 날짜</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isMessagesLoading ? (
                <For
                  each={Array.from({ length: 3 })}
                  render={(_, i) => (
                    <TableRow key={i}>
                      <For
                        each={Array.from({ length: 4 })}
                        render={(_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-[100px]" />
                          </TableCell>
                        )}
                      />
                    </TableRow>
                  )}
                />
              ) : messages.length > 0 ? (
                <For
                  each={messages}
                  render={(message) => (
                    <TableRow 
                      key={message.message.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedMessage(message)}
                    >
                      <TableCell>{message.message.title}</TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate">{message.message.content}</p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={message.message.isRead ? "secondary" : "default"}
                        >
                          {message.message.isRead ? "읽음" : "안읽음"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(message.message.createdAt), "PPP", {
                          locale: ko,
                        })}
                      </TableCell>
                    </TableRow>
                  )}
                />
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p>아직 보낸 메시지가 없습니다</p>
                      <p className="text-sm">상단의 메시지 보내기 버튼을 눌러 메시지를 보내보세요</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 메시지 상세 보기 다이얼로그 */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.message.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  보낸 날짜:{" "}
                  {selectedMessage && format(new Date(selectedMessage.message.createdAt), "PPP", {
                    locale: ko,
                  })}
                </div>
                <Badge 
                  variant={selectedMessage?.message.isRead ? "secondary" : "default"}
                >
                  {selectedMessage?.message.isRead ? "읽음" : "안읽음"}
                </Badge>
              </div>
              <div className="rounded-md border p-4">
                <p className="whitespace-pre-wrap">{selectedMessage?.message.content}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
