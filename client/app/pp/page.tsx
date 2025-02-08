export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">개인정보처리방침</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. 개인정보의 수집 및 이용 목적</h2>
          <p className="text-gray-600 dark:text-gray-300">
            회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 
            다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 
            개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
            <li>서비스 제공 및 계약의 이행</li>
            <li>회원 관리 및 서비스 이용 현황 분석</li>
            <li>신규 서비스 개발 및 마케팅에의 활용</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. 수집하는 개인정보 항목</h2>
          <p className="text-gray-600 dark:text-gray-300">
            회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
            <li>필수항목: 이메일 주소, 비밀번호</li>
            <li>자동수집항목: IP 주소, 쿠키, 서비스 이용 기록</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. 개인정보의 보유 및 이용기간</h2>
          <p className="text-gray-600 dark:text-gray-300">
            회사는 회원탈퇴 시 또는 수집・이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 
            단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 
            정한 일정한 기간 동안 회원정보를 보관합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. 개인정보의 파기절차 및 방법</h2>
          <p className="text-gray-600 dark:text-gray-300">
            회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 
            파기합니다. 파기절차 및 방법은 다음과 같습니다:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
            <li>파기절차: 회원탈퇴 시 즉시 파기</li>
            <li>파기방법: 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export const metadata = {
  title: '개인정보처리방침 - 코코아',
  description: '코코아 개인정보처리방침입니다.',
}
