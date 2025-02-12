import Dialog from "@/components/common/Dialog";

interface NicknameDialogProps {
  buttonText?: string;
  nickname: string;
  onChangeNickname: (newNickname: string) => void;
}

export default function NicknameDialog({
  buttonText = "닉네임 변경",
  nickname,
  onChangeNickname,
}: NicknameDialogProps) {
  return (
    <Dialog
      title="닉네임 변경"
      description="2-10자 이내로 입력해주세요"
      buttonText={buttonText}
      closeButtonText="취소"
      form={{
        initialValue: nickname,
        maxLength: 10,
        onSubmit: onChangeNickname,
      }}
    />
  );
} 