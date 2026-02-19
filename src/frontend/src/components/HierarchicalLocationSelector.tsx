import { useEffect, useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useGetCountries,
  useGetStatesByCountry,
  useGetDistrictsByState,
  useGetMPConstituenciesByDistrict,
  useGetMLAConstituenciesByMP,
  useGetMandalsByMLA,
  useGetVillagesByMandal,
} from '../hooks/useLocationQueries';

interface HierarchicalLocationSelectorProps {
  value?: string;
  onChange: (location: string) => void;
  initialLocation?: string;
}

interface SearchableSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled: boolean;
  isLoading: boolean;
  error?: Error | null;
  emptyMessage?: string;
}

function SearchableSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  isLoading,
  error,
  emptyMessage = 'No options available',
}: SearchableSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(query));
  }, [options, searchQuery]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <div>
      <Label htmlFor={id} className="text-sm font-semibold text-[oklch(0.15_0_0)] mb-2 block">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled} onOpenChange={setIsOpen}>
        <SelectTrigger
          id={id}
          className="bg-white border-[oklch(0.70_0.02_250)] text-[oklch(0.15_0_0)] focus:border-[oklch(0.45_0.12_250)] focus:ring-2 focus:ring-[oklch(0.45_0.12_250/0.2)]"
        >
          <SelectValue placeholder={isLoading ? 'Loading...' : placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[65vh]">
          {/* Search input - only show if there are options */}
          {options.length > 0 && (
            <div className="sticky top-0 z-10 bg-white border-b border-[oklch(0.85_0.02_250)] p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.50_0.03_250)]" />
                <Input
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Scrollable options list */}
          <ScrollArea className="max-h-[calc(65vh-60px)]">
            <div className="p-1">
              {error ? (
                <div className="px-2 py-1.5 text-sm text-red-600">Failed to load {label.toLowerCase()}</div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-[oklch(0.50_0.03_250)]">
                  {searchQuery ? `No results for "${searchQuery}"` : emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <SelectItem key={option} value={option} className="cursor-pointer">
                    {option}
                  </SelectItem>
                ))
              )}
            </div>
          </ScrollArea>
        </SelectContent>
      </Select>
      {isLoading && (
        <div className="flex items-center gap-2 mt-1 text-xs text-[oklch(0.50_0.03_250)]">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading {label.toLowerCase()}...
        </div>
      )}
    </div>
  );
}

export default function HierarchicalLocationSelector({
  value,
  onChange,
  initialLocation,
}: HierarchicalLocationSelectorProps) {
  const [country, setCountry] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [mpConstituency, setMpConstituency] = useState<string>('');
  const [mlaConstituency, setMlaConstituency] = useState<string>('');
  const [mandal, setMandal] = useState<string>('');
  const [village, setVillage] = useState<string>('');

  // Fetch data for each level
  const { data: countries = [], isLoading: loadingCountries, error: countriesError } = useGetCountries();
  const { data: states = [], isLoading: loadingStates, error: statesError } = useGetStatesByCountry(country);
  const { data: districts = [], isLoading: loadingDistricts, error: districtsError } = useGetDistrictsByState(state);
  const { data: mpConstituencies = [], isLoading: loadingMP, error: mpError } = useGetMPConstituenciesByDistrict(district);
  const { data: mlaConstituencies = [], isLoading: loadingMLA, error: mlaError } = useGetMLAConstituenciesByMP(mpConstituency);
  const { data: mandals = [], isLoading: loadingMandals, error: mandalsError } = useGetMandalsByMLA(mlaConstituency);
  const { data: villages = [], isLoading: loadingVillages, error: villagesError } = useGetVillagesByMandal(mandal);

  // Build location string from selected values
  useEffect(() => {
    const parts: string[] = [];
    if (village) parts.push(village);
    if (mandal) parts.push(mandal);
    if (mlaConstituency) parts.push(mlaConstituency);
    if (mpConstituency) parts.push(mpConstituency);
    if (district) parts.push(district);
    if (state) parts.push(state);
    if (country) {
      // Convert country code to readable name
      const countryName = country === 'IN' ? 'India' : country;
      parts.push(countryName);
    }

    const locationString = parts.join(', ');
    onChange(locationString);
  }, [country, state, district, mpConstituency, mlaConstituency, mandal, village, onChange]);

  // Reset downstream selections when upstream changes
  const handleCountryChange = (value: string) => {
    setCountry(value);
    setState('');
    setDistrict('');
    setMpConstituency('');
    setMlaConstituency('');
    setMandal('');
    setVillage('');
  };

  const handleStateChange = (value: string) => {
    setState(value);
    setDistrict('');
    setMpConstituency('');
    setMlaConstituency('');
    setMandal('');
    setVillage('');
  };

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setMpConstituency('');
    setMlaConstituency('');
    setMandal('');
    setVillage('');
  };

  const handleMPChange = (value: string) => {
    setMpConstituency(value);
    setMlaConstituency('');
    setMandal('');
    setVillage('');
  };

  const handleMLAChange = (value: string) => {
    setMlaConstituency(value);
    setMandal('');
    setVillage('');
  };

  const handleMandalChange = (value: string) => {
    setMandal(value);
    setVillage('');
  };

  const isIndiaSelected = country === 'IN';

  // Convert country codes to readable names for display
  const countryOptions = useMemo(() => {
    return countries.map((c) => (c === 'IN' ? 'India' : c));
  }, [countries]);

  const handleCountrySelectChange = (displayValue: string) => {
    const code = displayValue === 'India' ? 'IN' : displayValue;
    handleCountryChange(code);
  };

  const selectedCountryDisplay = country === 'IN' ? 'India' : country;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[oklch(0.45_0.12_250)] mb-2">
        <MapPin className="w-4 h-4" />
        <span className="text-sm font-medium">Select Your Location</span>
      </div>

      {/* Country Selection */}
      <SearchableSelect
        id="country"
        label="Country *"
        value={selectedCountryDisplay}
        onChange={handleCountrySelectChange}
        options={countryOptions}
        placeholder="Select country"
        disabled={loadingCountries}
        isLoading={loadingCountries}
        error={countriesError}
        emptyMessage="No countries available"
      />

      {/* State/UT Selection (India only) */}
      {isIndiaSelected && (
        <SearchableSelect
          id="state"
          label="State / Union Territory *"
          value={state}
          onChange={handleStateChange}
          options={states}
          placeholder="Select state/UT"
          disabled={!country || loadingStates}
          isLoading={loadingStates}
          error={statesError}
          emptyMessage="No states available"
        />
      )}

      {/* District Selection */}
      {isIndiaSelected && state && (
        <SearchableSelect
          id="district"
          label="District"
          value={district}
          onChange={handleDistrictChange}
          options={districts}
          placeholder="Select district"
          disabled={!state || loadingDistricts}
          isLoading={loadingDistricts}
          error={districtsError}
          emptyMessage="No districts available"
        />
      )}

      {/* MP Constituency Selection */}
      {isIndiaSelected && district && (
        <SearchableSelect
          id="mp"
          label="Lok Sabha (MP) Constituency"
          value={mpConstituency}
          onChange={handleMPChange}
          options={mpConstituencies}
          placeholder={mpConstituencies.length === 0 ? 'Not yet available' : 'Select MP constituency'}
          disabled={!district || loadingMP}
          isLoading={loadingMP}
          error={mpError}
          emptyMessage="Data coming soon"
        />
      )}

      {/* MLA Constituency Selection */}
      {isIndiaSelected && mpConstituency && (
        <SearchableSelect
          id="mla"
          label="Assembly (MLA) Constituency"
          value={mlaConstituency}
          onChange={handleMLAChange}
          options={mlaConstituencies}
          placeholder={mlaConstituencies.length === 0 ? 'Not yet available' : 'Select MLA constituency'}
          disabled={!mpConstituency || loadingMLA}
          isLoading={loadingMLA}
          error={mlaError}
          emptyMessage="Data coming soon"
        />
      )}

      {/* Mandal/Taluk Selection */}
      {isIndiaSelected && mlaConstituency && (
        <SearchableSelect
          id="mandal"
          label="Mandal / Taluk"
          value={mandal}
          onChange={handleMandalChange}
          options={mandals}
          placeholder={mandals.length === 0 ? 'Not yet available' : 'Select mandal/taluk'}
          disabled={!mlaConstituency || loadingMandals}
          isLoading={loadingMandals}
          error={mandalsError}
          emptyMessage="Data coming soon"
        />
      )}

      {/* Village Selection */}
      {isIndiaSelected && mandal && (
        <SearchableSelect
          id="village"
          label="Village"
          value={village}
          onChange={setVillage}
          options={villages}
          placeholder={villages.length === 0 ? 'Not yet available' : 'Select village'}
          disabled={!mandal || loadingVillages}
          isLoading={loadingVillages}
          error={villagesError}
          emptyMessage="Data coming soon"
        />
      )}

      {/* Help text */}
      {isIndiaSelected && !state && (
        <p className="text-xs text-[oklch(0.50_0.03_250)] mt-2">
          Please select your state/UT to continue with location selection
        </p>
      )}
    </div>
  );
}
