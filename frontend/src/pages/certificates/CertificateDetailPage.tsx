/**
 * Certificate Detail Page
 * Display certificate details with QR code for verification
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCertificate, useRevokeCertificate } from '@/hooks/useCertificateData';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Award, Download, Share2, CheckCircle2, Calendar, User, BookOpen, GraduationCap, Hash, Ban } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: certificate, isLoading, error, refetch } = useCertificate(id || '');
  const { mutate: revokeCertificate, isPending: isRevoking } = useRevokeCertificate();
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Certificate not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const verificationUrl = `${window.location.origin}${ROUTES.CERTIFICATES_VERIFY}?hash=${certificate.certificate_hash}`;
  const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${certificate.ipfs_hash}`;

  const handleDownload = async () => {
    try {
      const { certificateApi } = await import('@/services/api/certificate.api');
      const blob = await certificateApi.downloadCertificatePDF(certificate.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate-${certificate.certificate_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download certificate');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${certificate.metadata.course.title}`,
          text: `I completed the course "${certificate.metadata.course.title}"`,
          url: verificationUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(verificationUrl);
      toast.success('Verification link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Certificate Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Certificate Card */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              {/* Certificate Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Certificate of Completion
                </h2>
                <p className="text-gray-600">
                  This is to certify that
                </p>
              </div>

              {/* Student Name */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {certificate.metadata.student.name}
                </h3>
                <p className="text-gray-600">
                  has successfully completed the course
                </p>
              </div>

              {/* Course Info */}
              <div className="text-center mb-8 border-t border-b border-gray-200 py-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {certificate.metadata.course.title}
                </h4>
                <p className="text-gray-600 mb-4">
                  {certificate.metadata.course.description}
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {certificate.metadata.course.instructor.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {certificate.metadata.course.level}
                  </span>
                </div>
              </div>

              {/* Completion Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Completion Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(certificate.metadata.completion.date).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {certificate.metadata.completion.grade && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Final Grade</p>
                    <p className="font-semibold text-gray-900">
                      {certificate.metadata.completion.grade.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>

              {/* Certificate Number */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Certificate Number</p>
                <p className="font-mono text-sm text-gray-700">
                  {certificate.certificate_number}
                </p>
              </div>
            </Card>

            {/* Actions */}
            <div className="mt-6 flex gap-4">
              <Button onClick={handleDownload} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handleShare} variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {isAdmin && certificate.status === 'active' && (
                <Button 
                  onClick={() => setShowRevokeModal(true)} 
                  variant="outline" 
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Revoke
                </Button>
              )}
            </div>
            
            {/* Revoke Modal */}
            {showRevokeModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Revoke Certificate</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to revoke this certificate? This action cannot be undone.
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (optional)
                    </label>
                    <textarea
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={3}
                      placeholder="Enter reason for revocation..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowRevokeModal(false);
                        setRevokeReason('');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        revokeCertificate(
                          { id: certificate.id, reason: revokeReason },
                          {
                            onSuccess: () => {
                              toast.success('Certificate revoked successfully');
                              setShowRevokeModal(false);
                              setRevokeReason('');
                              refetch();
                            },
                            onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Failed to revoke certificate');
                            },
                          }
                        );
                      }}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      disabled={isRevoking}
                    >
                      {isRevoking ? 'Revoking...' : 'Revoke'}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar: Verification Info */}
          <div className="space-y-6">
            {/* QR Code */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Verify Certificate</h3>
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg mb-4">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mb-4">
                  Scan QR code to verify this certificate
                </p>
                <Link
                  to={`${ROUTES.CERTIFICATES_VERIFY}?hash=${certificate.certificate_hash}`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Open verification page →
                </Link>
              </div>
            </Card>

            {/* Certificate Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Certificate Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${
                      certificate.status === 'active' ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium capitalize">
                      {certificate.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Issued Date</p>
                  <p className="text-sm text-gray-900">
                    {new Date(certificate.issued_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Certificate Hash</p>
                  <p className="text-xs font-mono text-gray-700 break-all">
                    {certificate.certificate_hash}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">IPFS Hash</p>
                  <a
                    href={ipfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-blue-600 hover:text-blue-700 break-all"
                  >
                    {certificate.ipfs_hash}
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

