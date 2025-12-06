/**
 * Certificate Verification Page (Public)
 * Verify certificate by hash without authentication
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useVerifyCertificate } from '@/hooks/useCertificateData';
import { ROUTES } from '@/constants/routes';
import { CheckCircle2, XCircle, Award, Calendar, User, BookOpen, GraduationCap, Hash, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';

export default function CertificateVerifyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hashFromUrl = searchParams.get('hash') || '';
  const [hash, setHash] = useState(hashFromUrl);
  const [verifyHash, setVerifyHash] = useState(hashFromUrl);

  const { data: verifyResult, isLoading, refetch } = useVerifyCertificate(verifyHash, !!verifyHash);

  useEffect(() => {
    if (hashFromUrl) {
      setHash(hashFromUrl);
      setVerifyHash(hashFromUrl);
    }
  }, [hashFromUrl]);

  const handleVerify = () => {
    if (hash.trim()) {
      setVerifyHash(hash.trim());
      setSearchParams({ hash: hash.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Award className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600">
            Verify the authenticity of a certificate using its hash
          </p>
        </div>

        {/* Verification Input */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Hash
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="Enter certificate hash..."
                  className="flex-1 font-mono text-sm"
                />
                <Button onClick={handleVerify} disabled={!hash.trim() || isLoading}>
                  Verify
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter the certificate hash to verify its authenticity
              </p>
            </div>
          </div>
        </Card>

        {/* Verification Result */}
        {isLoading && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600">Verifying certificate...</p>
            </div>
          </Card>
        )}

        {verifyResult && !isLoading && (
          <Card className="p-8">
            {verifyResult.valid ? (
              <div className="space-y-6">
                {/* Success Header */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Certificate Verified
                  </h2>
                  <p className="text-green-600 font-medium">
                    This certificate is authentic and valid
                  </p>
                </div>

                {/* Certificate Details */}
                {verifyResult.certificate && (
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {verifyResult.certificate.metadata.course.title}
                      </h3>
                      <p className="text-gray-600">
                        {verifyResult.certificate.metadata.course.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Student</p>
                          <p className="font-medium text-gray-900">
                            {verifyResult.certificate.metadata.student.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Instructor</p>
                          <p className="font-medium text-gray-900">
                            {verifyResult.certificate.metadata.course.instructor.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Completion Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(verifyResult.certificate.metadata.completion.date).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {verifyResult.certificate.metadata.completion.grade && (
                        <div className="flex items-start gap-3">
                          <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Final Grade</p>
                            <p className="font-medium text-gray-900">
                              {verifyResult.certificate.metadata.completion.grade.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Certificate Number</p>
                          <p className="font-mono text-sm text-gray-900">
                            {verifyResult.certificate.certificate_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Certificate Invalid
                </h2>
                <p className="text-red-600 font-medium mb-4">
                  {verifyResult.error || 'This certificate could not be verified'}
                </p>
                {verifyResult.certificate && verifyResult.certificate.status !== 'active' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-yellow-800">
                          Certificate Status: {verifyResult.certificate.status}
                        </p>
                        {verifyResult.certificate.revoked_reason && (
                          <p className="text-xs text-yellow-700 mt-1">
                            Reason: {verifyResult.certificate.revoked_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <Link
            to={ROUTES.LANDING_PAGE}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

