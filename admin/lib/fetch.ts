import { API_ROUTE } from "./api";
import { useAuth } from "./store/use-auth";

export async function fetchWithAuth(url: string, config: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...config,
      credentials: "include",
    });

    if (response.status === 401) {
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ROUTE.ADMIN.REFRESH_TOKEN.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!refreshResponse.ok) {
        throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
      }

      const data = await refreshResponse.json();

      if (!data?.data?.accessToken || !data?.data?.refreshToken) {
        console.error("Invalid token data:", data);
        throw new Error("토큰 발급에 실패했습니다.");
      }

      // Zustand store 업데이트
      const auth = useAuth.getState();
      await auth.login({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });

      // 원래 요청 재시도
      return fetch(url, {
        ...config,
        credentials: "include",
      });
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    if (
      error instanceof Error &&
      error.message === "세션이 만료되었습니다. 다시 로그인해주세요."
    ) {
      const auth = useAuth.getState();
      await auth.logout();
      window.location.href = "/login";
    }
    throw error;
  }
}
