/**
 * Certificate Detail Page
 * Display certificate details with QR code for verification
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCertificate, useRevokeCertificate, useIssueCertificateToBlockchain, useDeleteCertificate } from '@/hooks/useCertificateData';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Award, Download, Share2, CheckCircle2, Calendar, User, BookOpen, GraduationCap, Hash, Ban, ExternalLink, Link as LinkIcon, Zap, Trash2 } from 'lucide-react';
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
  const { mutate: issueToBlockchain, isPending: isIssuingToBlockchain } = useIssueCertificateToBlockchain();
  const { mutate: deleteCertificate, isPending: isDeleting } = useDeleteCertificate();
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isOwner = certificate && user && certificate.user_id === user.id;
  const hasBlockchain = certificate && (certificate as any).blockchain_token_id;
  const canIssueToBlockchain = !hasBlockchain && (isOwner || isAdmin);

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
          <p className="text-gray-600 mb-4">Không tìm thấy chứng chỉ</p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </div>
    );
  }

  const verificationUrl = `${window.location.origin}${ROUTES.CERTIFICATES_VERIFY}?hash=${certificate.certificate_hash}`;
  const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${certificate.ipfs_hash}`;

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'Đang hoạt động',
      'revoked': 'Đã thu hồi',
      'expired': 'Đã hết hạn',
    };
    return statusMap[status] || status;
  };

  // Format date chuẩn: DD/MM/YYYY
  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format date đầy đủ: DD tháng MM, YYYY
  const formatDateFull = (date: string | Date): string => {
    const d = new Date(date);
    const day = d.getDate();
    const monthNames = ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
      'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  // Format hash để hiển thị (first 10 + ... + last 10)
  const formatHash = (hash: string, showLength: number = 10): string => {
    if (!hash || hash.length <= showLength * 2 + 3) return hash;
    return `${hash.substring(0, showLength)}...${hash.substring(hash.length - showLength)}`;
  };

  // Format certificate number chuẩn (đảm bảo format CERT-YYYYMMDD-XXXXX)
  const formatCertificateNumber = (certNumber: string): string => {
    // Đảm bảo format đúng: CERT-YYYYMMDD-XXXXX
    if (!certNumber) return '';
    // Nếu đã đúng format thì giữ nguyên
    if (/^CERT-\d{8}-[A-Z0-9]{5}$/.test(certNumber)) {
      return certNumber;
    }
    return certNumber;
  };

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
      toast.error(error.response?.data?.message || 'Không thể tải xuống chứng chỉ');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Chứng chỉ: ${certificate.metadata.course.title}`,
          text: `Tôi đã hoàn thành khóa học "${certificate.metadata.course.title}"`,
          url: verificationUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(verificationUrl);
      toast.success('Đã sao chép liên kết xác minh vào clipboard');
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
            ← Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết chứng chỉ</h1>
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
                  Chứng chỉ hoàn thành
                </h2>
                <p className="text-gray-600">
                  Chứng nhận rằng
                </p>
              </div>

              {/* Student Name */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {certificate.metadata.student.name}
                </h3>
                <p className="text-gray-600">
                  đã hoàn thành thành công khóa học
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
                  <p className="text-sm text-gray-500 mb-1">Ngày hoàn thành</p>
                  <p className="font-semibold text-gray-900">
                    {formatDateFull(certificate.metadata.completion.date)}
                  </p>
                </div>
                {certificate.metadata.completion.grade && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Điểm cuối khóa</p>
                    <p className="font-semibold text-gray-900">
                      {certificate.metadata.completion.grade.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>

              {/* Certificate Number */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Số chứng chỉ</p>
                <p className="font-mono text-sm text-gray-700 font-semibold">
                  {formatCertificateNumber(certificate.certificate_number)}
                </p>
              </div>
            </Card>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-4">
              <Button onClick={handleDownload} className="flex-1 min-w-[120px]">
                <Download className="w-4 h-4 mr-2" />
                Tải PDF
              </Button>
              <Button onClick={handleShare} variant="outline" className="flex-1 min-w-[120px]">
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
              {canIssueToBlockchain && (
                <Button 
                  onClick={() => {
                    if (id) {
                      issueToBlockchain(id, {
                        onSuccess: () => {
                          refetch();
                        }
                      });
                    }
                  }}
                  disabled={isIssuingToBlockchain}
                  variant="outline"
                  className="flex-1 min-w-[180px] border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  {isIssuingToBlockchain ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Đang phát hành...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Phát hành lên Blockchain
                    </>
                  )}
                </Button>
              )}
              {isAdmin && (
                <>
                  {certificate.status === 'active' && (
                    <Button 
                      onClick={() => setShowRevokeModal(true)} 
                      variant="outline" 
                      className="flex-1 min-w-[120px] border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Thu hồi
                    </Button>
                  )}
                  <Button 
                    onClick={() => setShowDeleteModal(true)} 
                    variant="outline" 
                    className="flex-1 min-w-[120px] border-red-500 text-red-700 hover:bg-red-50"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa vĩnh viễn
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
            
            {/* Revoke Modal */}
            {showRevokeModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Thu hồi chứng chỉ</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Bạn có chắc chắn muốn thu hồi chứng chỉ này? Hành động này không thể hoàn tác.
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do (tùy chọn)
                    </label>
                    <textarea
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={3}
                      placeholder="Nhập lý do thu hồi..."
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
                      Hủy
                    </Button>
                    <Button
                      onClick={() => {
                        revokeCertificate(
                          { id: certificate.id, reason: revokeReason },
                          {
                            onSuccess: () => {
                              toast.success('Đã thu hồi chứng chỉ thành công');
                              setShowRevokeModal(false);
                              setRevokeReason('');
                              refetch();
                            },
                            onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Không thể thu hồi chứng chỉ');
                            },
                          }
                        );
                      }}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      disabled={isRevoking}
                    >
                      {isRevoking ? 'Đang thu hồi...' : 'Thu hồi'}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xóa chứng chỉ vĩnh viễn</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Bạn có chắc chắn muốn xóa chứng chỉ này? Hành động này <strong>KHÔNG THỂ hoàn tác</strong> và sẽ xóa vĩnh viễn khỏi hệ thống.
                  </p>
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-700">
                      <strong>Lưu ý:</strong> Chứng chỉ sẽ bị xóa hoàn toàn, bao gồm cả dữ liệu blockchain (nếu có). Sau khi xóa, bạn có thể hoàn thành khóa học lại để tạo chứng chỉ mới với blockchain testnet.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowDeleteModal(false);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={() => {
                        if (id) {
                          deleteCertificate(id, {
                            onSuccess: () => {
                              setShowDeleteModal(false);
                              // Navigate to profile certificates tab after deletion
                              setTimeout(() => {
                                navigate('/profile?tab=certificates');
                              }, 1000);
                            },
                            onError: (error: any) => {
                              toast.error(error.response?.data?.message || 'Không thể xóa chứng chỉ');
                            },
                          });
                        }
                      }}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-700 hover:bg-red-50"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
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
              <h3 className="font-semibold text-gray-900 mb-4">Xác minh chứng chỉ</h3>
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
                  Quét mã QR để xác minh chứng chỉ này
                </p>
                <Link
                  to={`${ROUTES.CERTIFICATES_VERIFY}?hash=${certificate.certificate_hash}`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mở trang xác minh →
                </Link>
              </div>
            </Card>

            {/* Certificate Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Thông tin chứng chỉ</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${
                      certificate.status === 'active' ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium">
                      {getStatusText(certificate.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày cấp</p>
                  <p className="text-sm text-gray-900">
                    {new Date(certificate.issued_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mã băm chứng chỉ</p>
                  <p className="text-xs font-mono text-gray-700 break-all">
                    {certificate.certificate_hash}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mã băm IPFS</p>
                  <a
                    href={ipfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-blue-600 hover:text-blue-700 break-all"
                  >
                    {certificate.ipfs_hash}
                  </a>
                </div>
                
                {/* Blockchain Info */}
                {(certificate as any).blockchain_token_id ? (
                  <>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        Blockchain Testnet (NFT)
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Token ID</p>
                          <p className="text-xs font-mono text-gray-700">
                            #{(certificate as any).blockchain_token_id}
                          </p>
                        </div>
                        {(certificate as any).blockchain_network && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Network</p>
                            <p className="text-xs font-medium text-gray-700 capitalize">
                              {(certificate as any).blockchain_network}
                            </p>
                          </div>
                        )}
                        {(certificate as any).blockchain_tx_hash && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                            <a
                              href={(certificate as any).blockchain_explorer_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-blue-600 hover:text-blue-700 break-all flex items-center gap-1"
                              title="Xem transaction trên blockchain explorer"
                            >
                              {formatHash((certificate as any).blockchain_tx_hash, 10)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {(certificate as any).blockchain_contract_address && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Contract Address</p>
                            <a
                              href={`https://sepolia.etherscan.io/address/${(certificate as any).blockchain_contract_address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-blue-600 hover:text-blue-700 break-all flex items-center gap-1"
                              title="Xem smart contract trên blockchain explorer"
                            >
                              {formatHash((certificate as any).blockchain_contract_address, 8)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {(certificate as any).blockchain_opensea_url && (
                          <div>
                            <a
                              href={(certificate as any).blockchain_opensea_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              {((certificate as any).blockchain_network === 'sepolia' || 
                                (certificate as any).blockchain_network === 'mumbai' || 
                                (certificate as any).blockchain_network === 'amoy') 
                                ? 'Xem trên Blockchain Explorer' 
                                : 'Xem trên OpenSea'}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <p className="text-xs text-gray-400 mt-1 italic">
                              {((certificate as any).blockchain_network === 'sepolia' || 
                                (certificate as any).blockchain_network === 'mumbai' || 
                                (certificate as any).blockchain_network === 'amoy') 
                                && 'OpenSea đã ngừng hỗ trợ testnet. Dùng blockchain explorer để xem NFT.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Blockchain</p>
                    <p className="text-xs text-gray-400 italic">
                      Chứng chỉ chưa được phát hành lên blockchain. Kết nối ví MetaMask trong Profile để nhận NFT khi hoàn thành khóa học.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

