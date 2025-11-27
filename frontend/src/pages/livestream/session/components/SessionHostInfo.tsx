import { Eye, Facebook, Globe, Instagram, Link as LinkIcon, Mail, Users, Youtube } from 'lucide-react';
import type { LiveSession } from '@/services/api/livestream.api';

type HostProfileMeta = Record<string, any>;

interface HostContactDisplay {
  label?: string;
  value: string;
  href?: string;
  icon?: 'mail' | 'facebook' | 'instagram' | 'youtube' | 'website' | 'link';
}

interface HostSocialDisplay {
  label?: string;
  platform?: string;
  url: string;
}

interface SessionHostInfoProps {
  session: LiveSession;
}

const formatFollowers = (value?: number) => {
  if (value === undefined || value === null) return undefined;
  if (value >= 1000000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const normalizeHostProfile = (metadata?: Record<string, any>): HostProfileMeta | undefined => {
  if (!metadata) return undefined;
  const keys = ['hostProfile', 'host_profile', 'host', 'presenter'];
  for (const key of keys) {
    const candidate = metadata[key];
    if (candidate && typeof candidate === 'object') {
      return candidate as HostProfileMeta;
    }
  }
  return undefined;
};

const normalizeContacts = (profile: HostProfileMeta | undefined, session: LiveSession): HostContactDisplay[] => {
  const items: HostContactDisplay[] = [];
  if (!profile && !session.course?.title) {
    return items;
  }

  const possibleLists = [profile?.contacts, profile?.contact, profile?.contactInfo];
  possibleLists.forEach(list => {
    if (Array.isArray(list)) {
      list.forEach(entry => {
        if (typeof entry === 'string') {
          items.push({ value: entry });
          return;
        }
        if (entry && typeof entry === 'object') {
          const label = entry.label ?? entry.title;
          const value = entry.value ?? entry.text ?? entry.url;
          if (typeof value === 'string' && value.trim().length > 0) {
            items.push({
              label,
              value,
              href: entry.href ?? entry.url,
              icon: entry.icon,
            });
          }
        }
      });
    }
  });

  if (profile?.email) {
    items.push({
      label: 'Email',
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: 'mail',
    });
  }

  if (profile?.facebook) {
    items.push({
      label: 'Facebook',
      value: profile.facebook,
      href: profile.facebook,
      icon: 'facebook',
    });
  }

  if (profile?.website) {
    items.push({
      label: 'Website',
      value: profile.website,
      href: profile.website,
      icon: 'website',
    });
  }

  if (!items.length && session.course?.title) {
    items.push({
      label: 'Khóa học',
      value: session.course.title,
    });
  }

  return items;
};

const normalizeSocials = (profile: HostProfileMeta | undefined): HostSocialDisplay[] => {
  const socials: HostSocialDisplay[] = [];
  const possibleLists = [profile?.socials, profile?.links];
  possibleLists.forEach(list => {
    if (Array.isArray(list)) {
      list.forEach(entry => {
        if (entry && typeof entry === 'object' && typeof entry.url === 'string') {
          socials.push({
            url: entry.url,
            label: entry.label ?? entry.title,
            platform: entry.platform ?? entry.type,
          });
        } else if (typeof entry === 'string') {
          socials.push({ url: entry, platform: 'link' });
        }
      });
    }
  });

  if (!socials.length && profile?.facebook) {
    socials.push({ url: profile.facebook, platform: 'facebook' });
  }

  if (!socials.length && profile?.website) {
    socials.push({ url: profile.website, platform: 'website' });
  }

  return socials;
};

const SocialIcon = ({ platform }: { platform?: string }) => {
  const key = platform?.toLowerCase();
  if (key?.includes('facebook')) return <Facebook className="w-4 h-4" />;
  if (key?.includes('instagram')) return <Instagram className="w-4 h-4" />;
  if (key?.includes('youtube')) return <Youtube className="w-4 h-4" />;
  if (key?.includes('web') || key?.includes('site')) return <Globe className="w-4 h-4" />;
  if (key?.includes('mail')) return <Mail className="w-4 h-4" />;
  return <LinkIcon className="w-4 h-4" />;
};

const ContactIcon = ({ icon }: { icon?: HostContactDisplay['icon'] }) => {
  switch (icon) {
    case 'mail':
      return <Mail className="w-4 h-4 text-gray-500" />;
    case 'facebook':
      return <Facebook className="w-4 h-4 text-blue-600" />;
    case 'instagram':
      return <Instagram className="w-4 h-4 text-pink-500" />;
    case 'youtube':
      return <Youtube className="w-4 h-4 text-red-500" />;
    case 'website':
      return <Globe className="w-4 h-4 text-blue-500" />;
    default:
      return <LinkIcon className="w-4 h-4 text-gray-500" />;
  }
};

export function SessionHostInfo({ session }: SessionHostInfoProps) {
  const metadata = (session.metadata ?? {}) as Record<string, any>;
  const hostProfile = normalizeHostProfile(metadata);

  const avatar =
    hostProfile?.avatar ||
    session.host?.avatar ||
    session.instructor_avatar ||
    undefined;

  const hostName =
    hostProfile?.displayName ||
    hostProfile?.name ||
    [session.host?.first_name, session.host?.last_name].filter(Boolean).join(' ').trim() ||
    session.instructor_name ||
    'Giảng viên livestream';

  const badge =
    hostProfile?.badge ||
    session.host?.role ||
    (session.platform ? session.platform.toUpperCase() : undefined);

  const followerLabel = formatFollowers(hostProfile?.followers);
  const contactItems = normalizeContacts(hostProfile, session);
  const socialLinks = normalizeSocials(hostProfile);

  if (!hostName && !contactItems.length && !socialLinks.length) {
    return null;
  }

  return (
    <div className="border-b border-gray-100 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-semibold">
            {avatar ? (
              <img src={avatar} alt={hostName} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(hostName)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold text-gray-900 truncate">{hostName}</p>
              {badge && (
                <span className="text-xs font-semibold uppercase tracking-wide bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full w-fit">
                  {badge}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
              {followerLabel && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Followers <strong>{followerLabel}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide">Giới thiệu</p>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">
            {hostProfile?.bio ||
              hostProfile?.about ||
              'Giảng viên đang phát trực tiếp trên nền tảng của GekLearn.'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide">Liên hệ</p>
            {contactItems.length > 0 ? (
              <div className="mt-2 space-y-2">
                {contactItems.map((contact, index) => (
                  <div key={`${contact.value}-${index}`} className="flex items-start gap-2 text-sm text-gray-700">
                    <ContactIcon icon={contact.icon} />
                    {contact.href ? (
                      <a href={contact.href} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                        {contact.label ? `${contact.label}: ` : ''}
                        {contact.value}
                      </a>
                    ) : (
                      <span className="break-all">
                        {contact.label ? `${contact.label}: ` : ''}
                        {contact.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Thông tin liên hệ sẽ được cập nhật sớm.</p>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide">Kênh khác</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={`${social.url}-${index}`}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <SocialIcon platform={social.platform} />
                    {social.label || social.platform || 'Link'}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
}


