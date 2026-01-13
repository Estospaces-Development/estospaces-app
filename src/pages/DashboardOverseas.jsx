import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Search,
  ArrowLeft,
  FileText,
  Calendar,
  MessageSquare,
  CreditCard,
  User,
  HelpCircle,
  ShieldCheck,
  FileSignature,
  Bell,
  Heart,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import PropertyCard from '../components/Dashboard/PropertyCard';
import PropertyCardSkeleton from '../components/Dashboard/PropertyCardSkeleton';
import DashboardFooter from '../components/Dashboard/DashboardFooter';

const countryImages = {
  Spain: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=1200&q=60',
  France: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=60',
  Portugal: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=60',
  Cyprus: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1200&q=60',
  Italy: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=70',
  Greece: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=60',
  USA: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=60',
  Ireland: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60',
  Turkey: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=60',
  UAE: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=60',
};

const quickLinks = [
  { label: 'Saved Properties', icon: Heart, path: '/user/dashboard/saved' },
  { label: 'My Applications', icon: FileText, path: '/user/dashboard/applications' },
  { label: 'Viewings', icon: Calendar, path: '/user/dashboard/viewings' },
  { label: 'Messages', icon: MessageSquare, path: '/user/dashboard/messages' },
  { label: 'Payments', icon: CreditCard, path: '/user/dashboard/payments' },
  { label: 'Contracts', icon: FileText, path: '/user/dashboard/contracts' },
  { label: 'Profile', icon: User, path: '/user/dashboard/profile' },
  { label: 'Help & Support', icon: HelpCircle, path: '/user/dashboard/help' },
];

const toCardProperty = (row) => {
  let images = [];
  try {
    if (row?.image_urls) {
      images = Array.isArray(row.image_urls) ? row.image_urls : JSON.parse(row.image_urls || '[]');
    }
  } catch (e) {
    images = [];
  }

  const primaryImage =
    images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';

  return {
    id: row.id,
    title: row.title,
    location:
      row.address_line_1 ||
      `${row.city || ''} ${row.postcode || ''}`.trim() ||
      row.country ||
      'Overseas',
    price: row.price,
    type:
      row.listing_type === 'rent'
        ? 'Rent'
        : row.listing_type === 'sale'
          ? 'Sale'
          : 'Property',
    property_type: row.property_type,
    listing_type: row.listing_type,
    beds: row.bedrooms,
    baths: row.bathrooms,
    area: row.area,
    image: primaryImage,
    images: images?.length ? images : [primaryImage],
    description: row.description,
    is_saved: false,
    is_applied: false,
    latitude: row.latitude,
    longitude: row.longitude,
    listedDate: row.created_at ? new Date(row.created_at) : new Date(),
    view_count: row.view_count || 0,
    application_status: row.application_status || null,
  };
};

const DashboardOverseas = () => {
  const navigate = useNavigate();
  const [listingType, setListingType] = useState('sale');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [countriesSample, setCountriesSample] = useState([]);

  const countries = useMemo(() => {
    const counts = new Map();
    for (const row of countriesSample) {
      const country = row?.country;
      if (!country || country === 'UK') continue;
      counts.set(country, (counts.get(country) || 0) + 1);
    }
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country]) => country);

    if (sorted.length > 0) return sorted;
    return ['Spain', 'France', 'Portugal', 'Cyprus', 'Italy', 'Greece', 'USA', 'Ireland', 'Turkey', 'UAE'];
  }, [countriesSample]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  useEffect(() => {
    let cancelled = false;
    const loadCountriesSample = async () => {
      setError(null);
      try {
        const { data, error: qError } = await supabase
          .from('properties')
          .select('country')
          .not('country', 'is', null)
          .neq('country', 'UK')
          .limit(500);

        if (qError) throw qError;
        if (!cancelled) setCountriesSample(data || []);
      } catch (e) {
        if (!cancelled) setCountriesSample([]);
      }
    };
    loadCountriesSample();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchOverseas = async () => {
      setLoading(true);
      setError(null);
      try {
        const from = (page - 1) * limit;
        let query = supabase
          .from('properties')
          .select('*', { count: 'exact' })
          .not('country', 'is', null)
          .neq('country', 'UK')
          .eq('listing_type', listingType)
          .or('status.eq.online,status.eq.published,status.eq.active')
          .order('created_at', { ascending: false })
          .range(from, from + limit - 1);

        if (selectedCountry) {
          query = query.eq('country', selectedCountry);
        }

        const q = searchQuery.trim();
        if (q) {
          const escaped = q.replaceAll(',', ' ');
          query = query.or(
            `title.ilike.%${escaped}%,description.ilike.%${escaped}%,city.ilike.%${escaped}%,postcode.ilike.%${escaped}%,address_line_1.ilike.%${escaped}%`
          );
        }

        const { data, error: qError, count } = await query;
        if (qError) throw qError;

        if (!cancelled) {
          setRows(data || []);
          setTotalCount(count || 0);
        }
      } catch (e) {
        if (!cancelled) {
          setRows([]);
          setTotalCount(0);
          setError(e?.message || 'Failed to load overseas properties');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOverseas();
    return () => {
      cancelled = true;
    };
  }, [listingType, searchQuery, selectedCountry, page, limit]);

  const cardProperties = useMemo(() => rows.map(toCardProperty), [rows]);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto dark:bg-[#0a0a0a] min-h-screen">
      <button
        onClick={() => navigate('/user/dashboard')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </button>

      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-black">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1600&q=70"
            srcSet="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=70 800w, https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=70 1200w, https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1600&q=70 1600w, https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=2000&q=70 2000w"
            sizes="(max-width: 1024px) 100vw, 1200px"
            alt="Venice, Italy"
            className="w-full h-full object-cover object-center"
            decoding="async"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/10" />
        <div className="relative p-6 lg:p-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white text-sm font-medium mb-4">
              <Globe size={16} />
              Overseas
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">
              Find your next home overseas
            </h1>
            <p className="text-white/90 mb-6">
              Search properties worldwide with the same Estospaces experience: save, apply, book viewings, pay, and sign contracts.
            </p>

            <div className="bg-white rounded-xl p-3 shadow-xl border border-white/30">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                  <Search size={18} className="text-gray-500" />
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setPage(1);
                      setSearchQuery(e.target.value);
                    }}
                    placeholder="Search by country, city, postcode, or keyword"
                    className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setListingType('sale');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      listingType === 'sale'
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    For Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setListingType('rent');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      listingType === 'rent'
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    To Rent
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
                <span className="text-xs text-gray-500">Quick picks:</span>
                {['Spain', 'France', 'UAE', 'USA'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setSelectedCountry(c);
                    }}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    {c}
                  </button>
                ))}
                {selectedCountry && (
                  <button
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setSelectedCountry(null);
                    }}
                    className="text-xs px-2 py-1 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors"
                  >
                    Clear country
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-left hover:shadow-md transition-all"
            >
              <Icon size={18} className="text-orange-600 dark:text-orange-400 mb-2" />
              <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">{item.label}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Most popular countries</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pick a country to filter listings</p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCountry ? `Showing: ${selectedCountry}` : 'Showing: All overseas'}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {countries.map((country) => {
              const img = countryImages[country] || `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(country)},travel`;
              const active = selectedCountry === country;
              return (
                <button
                  key={country}
                  onClick={() => {
                    setPage(1);
                    setSelectedCountry(country);
                  }}
                  className={`rounded-xl border overflow-hidden text-left transition-all ${
                    active
                      ? 'border-orange-500 ring-2 ring-orange-500/30'
                      : 'border-gray-200 dark:border-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className="h-20 bg-gray-100">
                    <img src={img} alt={country} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{country}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Buying overseas safely</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
            Built around the same user dashboard features you already use.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <ShieldCheck size={18} className="text-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Verified agents</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Trusted contacts and clear listing details.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <CreditCard size={18} className="text-orange-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Secure payments</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Track bills and payments in the Payments tab.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <FileSignature size={18} className="text-blue-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Digital contracts</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">View and sign documents in Contracts.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <Bell size={18} className="text-purple-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Updates & reminders</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Keep track of applications and viewing status.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Overseas listings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {listingType === 'rent' ? 'To rent' : 'For sale'}
              {selectedCountry ? ` • ${selectedCountry}` : ''} • {totalCount.toLocaleString()} results
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={page <= 1}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              Prev
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} / {totalPages}
            </div>
            <button
              type="button"
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
              <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setError(null);
                  setLoading(true);
                  setRows([]);
                  setTotalCount(0);
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold"
              >
                Retry
              </button>
            </div>
          ) : cardProperties.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-3">No overseas properties found.</p>
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setSearchQuery('');
                  setSelectedCountry(null);
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cardProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default DashboardOverseas;
