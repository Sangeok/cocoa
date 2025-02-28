"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { API_ROUTE, payloadMaker } from "@/lib/api";
import Link from "next/link";
import { ControllerRenderProps } from "react-hook-form";
import { BannerItem } from "@/types/banner";
import { fetchWithAuth } from "@/lib/fetch";

const formSchema = z.object({
  bannerItemId: z.string().min(1, "배너 위치를 선택해주세요"),
  forwardUrl: z.string().url("올바른 URL을 입력해주세요"),
  startAt: z.string().min(1, "시작일을 선택해주세요"),
  endAt: z.string().min(1, "종료일을 선택해주세요"),
  paymentType: z.enum(["cash", "cocoaMoney"] as const, {
    required_error: "결제 방식을 선택해주세요",
  }),
  image: z.instanceof(File, { message: "이미지를 선택해주세요" }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateBannerPage() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bannerItemId: "",
      forwardUrl: "",
      startAt: "",
      endAt: "",
      paymentType: "cash",
    },
  });

  const { data: bannerItems } = useQuery<BannerItem[]>({
    queryKey: ["bannerItems"],
    queryFn: async () => {
      const { url, config } = payloadMaker({
        method: "GET",
        url: API_ROUTE.BANNER.ITEMS.LIST.url,
      });
      const response = await fetch(url, config);
      const json = await response.json();
      return json.data;
    },
  });

  const { mutate: createBanner, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const formData = new FormData();
      formData.append("bannerItemId", values.bannerItemId);
      formData.append("forwardUrl", values.forwardUrl);
      formData.append("startAt", values.startAt);
      formData.append("endAt", values.endAt);
      formData.append("paymentType", values.paymentType);
      if (values.image) {
        formData.append("image", values.image);
      }

      const { url, config } = payloadMaker({
        method: "POST",
        url: API_ROUTE.BANNER.ITEMS.CREATE.url,
      });

      const response = await fetchWithAuth(url, {
        ...config,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "배너 생성에 실패했습니다");
      }
    },
    onSuccess: () => {
      router.push("/banners");
      router.refresh();
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const selectedBannerItem = bannerItems?.find(
    (item) => item.id.toString() === form.watch("bannerItemId")
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">배너 생성</h1>
          <p className="text-muted-foreground">
            새로운 광고 배너를 생성합니다.
          </p>
        </div>
        <Link href="/banners">
          <Button variant="outline">배너 목록으로 돌아가기</Button>
        </Link>
      </div>

      <div className="border rounded-lg p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => createBanner(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="bannerItemId"
              render={({
                field,
              }: {
                field: ControllerRenderProps<FormValues, "bannerItemId">;
              }) => (
                <FormItem>
                  <FormLabel>배너 위치</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="배너 위치 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bannerItems?.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.routePath} - {item.position} ({item.deviceType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedBannerItem && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p>
                  <strong>권장 이미지 크기:</strong>{" "}
                  {selectedBannerItem.recommendedImageSize}
                </p>
                <p>
                  <strong>일일 현금 가격:</strong>{" "}
                  {parseInt(selectedBannerItem.pricePerDay).toLocaleString()}원
                </p>
                <p>
                  <strong>일일 코코아 머니:</strong>{" "}
                  {parseInt(
                    selectedBannerItem.cocoaMoneyPerDay
                  ).toLocaleString()}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="paymentType"
              render={({
                field,
              }: {
                field: ControllerRenderProps<FormValues, "paymentType">;
              }) => (
                <FormItem>
                  <FormLabel>결제 방식</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="결제 방식 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">현금 결제</SelectItem>
                      <SelectItem value="cocoaMoney">
                        코코아 머니 결제
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="forwardUrl"
              render={({
                field,
              }: {
                field: ControllerRenderProps<FormValues, "forwardUrl">;
              }) => (
                <FormItem>
                  <FormLabel>이동 URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startAt"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<FormValues, "startAt">;
                }) => (
                  <FormItem>
                    <FormLabel>시작일</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endAt"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<FormValues, "endAt">;
                }) => (
                  <FormItem>
                    <FormLabel>종료일</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>배너 이미지</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </FormControl>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mt-2 max-w-xs rounded"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "생성 중..." : "생성하기"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
