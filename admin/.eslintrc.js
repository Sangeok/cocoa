module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",         // 미사용 변수 허용
    "@typescript-eslint/no-empty-interface": "off",     // 빈 인터페이스 허용
    "@typescript-eslint/no-empty-object-type": "off",   // 빈 객체 타입 허용
    "@typescript-eslint/no-explicit-any": "off",        // any 타입 허용
    "no-unused-vars": "off",                           // JavaScript 미사용 변수 허용
  },
  // TypeScript 파일에 대해서만 @typescript-eslint 규칙 적용
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
    }
  ]
};
