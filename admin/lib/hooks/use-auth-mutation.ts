import { useMutation } from "@tanstack/react-query";
import {
  API_ROUTE,
  LoginDto,
  LoginResponseDto,
  ApiResponse,
  AdminProfile,
  payloadMaker,
} from "../api";
import { useAuth } from "../store/use-auth";
import { useRouter } from "next/navigation";
import { useProfile } from "../store/use-profile";

export const authKeys = {
  profile: ["auth", "profile"] as const,
};

export function useAuthMutation() {
  const { login } = useAuth();
  const { setProfile } = useProfile();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginDto) => {
      // 1. 로그인 요청
      const { url: loginUrl, config: loginConfig } = payloadMaker({
        ...API_ROUTE.ADMIN.LOGIN,
        body: credentials,
      });

      const loginResponse = await fetch(loginUrl, loginConfig);

      if (!loginResponse.ok) {
        const error = await loginResponse.json();
        throw new Error(error.message || "로그인에 실패했습니다");
      }

      const loginData = (await loginResponse.json()) as LoginResponseDto;

      // 2. 프로필 정보 요청
      const { url: profileUrl, config: profileConfig } = payloadMaker({
        ...API_ROUTE.ADMIN.GET_PROFILE,
        token: loginData.accessToken,
      });

      const profileResponse = await fetch(profileUrl, profileConfig);
      if (!profileResponse.ok) {
        throw new Error("프로필 정보를 가져오는데 실패했습니다");
      }

      const { data: profileData } =
        (await profileResponse.json()) as ApiResponse<AdminProfile>;

      return {
        tokens: loginData,
        profile: profileData,
      };
    },
    onSuccess: async (data) => {
      // 상태 업데이트 완료 후 페이지 이동
      await login({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });

      document.cookie = `access_token=${data.tokens.accessToken}; path=/`;
      document.cookie = `refresh_token=${data.tokens.refreshToken}; path=/`;

      setProfile(data.profile);
      router.push("/");
    },
  });
}
