export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">서비스 이용약관</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">제 1 조 (목적)</h2>
          <p className="text-gray-600 dark:text-gray-300">
            본 약관은 코코아(이하 "회사")가 제공하는 암호화폐 정보 서비스(이하 "서비스")의 이용조건 및 절차, 
            회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">제 2 조 (용어의 정의)</h2>
          <p className="text-gray-600 dark:text-gray-300">
            본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
            <li>"서비스"란 회사가 제공하는 모든 암호화폐 관련 정보 및 기능을 의미합니다.</li>
            <li>"회원"이란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</li>
            <li>"콘텐츠"란 서비스에서 제공하는 모든 형태의 정보를 의미합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">제 3 조 (약관의 효력)</h2>
          <p className="text-gray-600 dark:text-gray-300">
            1. 본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.<br />
            2. 회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">제 4 조 (면책조항)</h2>
          <p className="text-gray-600 dark:text-gray-300">
            1. 회사는 서비스에서 제공하는 정보의 정확성, 신뢰성, 적시성을 보장하지 않습니다.<br />
            2. 회원은 서비스에서 제공하는 정보를 투자 결정의 참고자료로만 활용해야 하며, 
               투자 결과에 대한 책임은 전적으로 회원 본인에게 있습니다.
          </p>
        </section>
      </div>
    </div>
  )
}

export const metadata = {
  title: '서비스 이용약관 - 코코아',
  description: '코코아 서비스 이용약관입니다.',
}
