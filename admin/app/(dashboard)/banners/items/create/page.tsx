"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
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
import { fetchWithAuth } from "@/lib/fetch";

const formSchema = z.object({
  routePath: z.string().min(1, "경로를 입력해주세요"),
  deviceType: z.enum(["desktop", "tablet", "mobile"] as const, {
    required_error: "디바이스 타입을 선택해주세요",
  }),
  position: z.enum(["top", "middle", "bottom"] as const, {
    required_error: "위치를 선택해주세요",
  }),
  recommendedImageSize: z.string().min(1, "권장 이미지 크기를 입력해주세요"),
  pricePerDay: z.string().min(1, "일일 가격을 입력해주세요"),
  cocoaMoneyPerDay: z.string().min(1, "일일 코코아 머니 가격을 입력해주세요"),
  previewImage: z.instanceof(File, { message: "미리보기 이미지를 선택해주세요" }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateBannerItemPage() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      routePath: "/",
      deviceType: "desktop",
      position: "top",
      recommendedImageSize: "",
      pricePerDay: "",
      cocoaMoneyPerDay: "",
    },
  });

  const { mutate: createBannerItem, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const formData = new FormData();
      formData.append("routePath", values.routePath);
      formData.append("deviceType", values.deviceType);
      formData.append("position", values.position);
      formData.append("recommendedImageSize", values.recommendedImageSize);
      formData.append("pricePerDay", String(parseInt(values.pricePerDay)));
      formData.append("cocoaMoneyPerDay", String(parseInt(values.cocoaMoneyPerDay)));
      if (values.previewImage) {
        formData.append("previewImage", values.previewImage);
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
        throw new Error(errorData.message || "배너 위치 생성에 실패했습니다");
      }
    },
    onSuccess: () => {
      router.push("/banners/items");
      router.refresh();
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("previewImage", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">배너 위치 생성</h1>
          <p className="text-muted-foreground">
            새로운 배너 위치를 생성합니다.
          </p>
        </div>
        <Link href="/banners/items">
          <Button variant="outline">배너 위치 목록으로 돌아가기</Button>
        </Link>
      </div>

      <div className="border rounded-lg p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => createBannerItem(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="routePath"
              render={({ field }: { field: ControllerRenderProps<FormValues, "routePath"> }) => (
                <FormItem>
                  <FormLabel>경로</FormLabel>
                  <FormControl>
                    <Input placeholder="/" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deviceType"
              render={({ field }: { field: ControllerRenderProps<FormValues, "deviceType"> }) => (
                <FormItem>
                  <FormLabel>디바이스 타입</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="디바이스 타입 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }: { field: ControllerRenderProps<FormValues, "position"> }) => (
                <FormItem>
                  <FormLabel>위치</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="위치 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="top">상단</SelectItem>
                      <SelectItem value="middle">중단</SelectItem>
                      <SelectItem value="bottom">하단</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recommendedImageSize"
              render={({ field }: { field: ControllerRenderProps<FormValues, "recommendedImageSize"> }) => (
                <FormItem>
                  <FormLabel>권장 이미지 크기</FormLabel>
                  <FormControl>
                    <Input placeholder="1920x300" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pricePerDay"
              render={({ field }: { field: ControllerRenderProps<FormValues, "pricePerDay"> }) => (
                <FormItem>
                  <FormLabel>일일 현금 가격 (원)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cocoaMoneyPerDay"
              render={({ field }: { field: ControllerRenderProps<FormValues, "cocoaMoneyPerDay"> }) => (
                <FormItem>
                  <FormLabel>일일 코코아 머니 가격</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previewImage"
              render={() => (
                <FormItem>
                  <FormLabel>미리보기 이미지</FormLabel>
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
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending ? "생성 중..." : "생성하기"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 