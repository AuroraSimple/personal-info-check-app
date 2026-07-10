import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

const FormSchema = z.object({
  text: z.string().min(1, '텍스트를 입력하세요').max(10000, '10000자 이내여야 합니다')
});

type FormData = z.infer<typeof FormSchema>;

interface PIIDetection {
  type: string;
  value: string;
  position: { start: number; end: number };
  confidence: number;
}

interface CheckResult {
  hasPII: boolean;
  detections: PIIDetection[];
  summary: {
    totalFound: number;
    byType: Record<string, number>;
  };
}

export default function App() {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(FormSchema)
  });

  const textValue = watch('text');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post<CheckResult>('/api/check', {
        text: data.text
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '오류가 발생했습니다');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string) => {
    if (!result || result.detections.length === 0) {
      return text;
    }

    const parts: Array<{ text: string; isDetection: boolean; detection?: PIIDetection }> = [];
    let lastIndex = 0;

    for (const detection of result.detections) {
      if (detection.position.start > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, detection.position.start),
          isDetection: false
        });
      }

      parts.push({
        text: text.substring(detection.position.start, detection.position.end),
        isDetection: true,
        detection
      });

      lastIndex = detection.position.end;
    }

    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        isDetection: false
      });
    }

    return parts;
  };

  const typeColors: Record<string, string> = {
    email: 'bg-red-200 text-red-900',
    phone: 'bg-orange-200 text-orange-900',
    ssn: 'bg-red-300 text-red-900',
    credit_card: 'bg-purple-200 text-purple-900',
    name: 'bg-blue-200 text-blue-900'
  };

  const typeLabels: Record<string, string> = {
    email: '이메일',
    phone: '전화번호',
    ssn: 'SSN',
    credit_card: '신용카드',
    name: '이름'
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🔍 개인정보 검사</h1>
        <p className="text-gray-600 mb-8">텍스트에 포함된 개인정보(이메일, 전화번호 등)를 자동으로 감지합니다</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검사할 텍스트
            </label>
            <textarea
              {...register('text')}
              placeholder="검사하고 싶은 텍스트를 입력하세요..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            {errors.text && (
              <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !textValue}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '검사 중...' : '검사 시작'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className={`p-4 rounded-lg ${result.hasPII ? 'bg-red-100 border border-red-300' : 'bg-green-100 border border-green-300'}`}>
              <h3 className={`text-lg font-semibold ${result.hasPII ? 'text-red-900' : 'text-green-900'}`}>
                {result.hasPII ? '⚠️ 개인정보 발견됨!' : '✅ 개인정보 없음'}
              </h3>
              <p className={result.hasPII ? 'text-red-800' : 'text-green-800'}>
                총 {result.summary.totalFound}개의 개인정보 항목이 감지되었습니다
              </p>
            </div>

            {result.detections.length > 0 && (
              <>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">감지 요약</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.summary.byType).map(([type, count]) => (
                      <span
                        key={type}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${typeColors[type] || 'bg-gray-200'}`}
                      >
                        {typeLabels[type] || type}: {count}개
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">강조된 텍스트</h4>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg leading-relaxed">
                    {typeof highlightText(textValue) === 'string' ? (
                      highlightText(textValue)
                    ) : (
                      highlightText(textValue).map((part, idx) => (
                        part.isDetection ? (
                          <span
                            key={idx}
                            className={`${typeColors[part.detection!.type] || 'bg-yellow-200'} px-1 rounded cursor-help`}
                            title={`${typeLabels[part.detection!.type] || part.detection!.type} (확신도: ${Math.round(part.detection!.confidence * 100)}%)`}
                          >
                            {part.text}
                          </span>
                        ) : (
                          <span key={idx}>{part.text}</span>
                        )
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">상세 결과</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.detections.map((detection, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${typeColors[detection.type] || 'bg-gray-100'}`}>
                        <div className="font-medium">
                          {typeLabels[detection.type] || detection.type}
                        </div>
                        <div className="text-sm opacity-75">
                          값: {detection.value} | 확신도: {Math.round(detection.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-center text-white text-sm mt-8 opacity-80">
        모든 검사는 로컬에서 처리되며, 입력한 데이터는 저장되지 않습니다
      </p>
    </div>
  );
}
