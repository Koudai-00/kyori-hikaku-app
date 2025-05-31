import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PlaceResult {
  name: string;
  address: string;
  placeId: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface PlaceAutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string, placeData?: PlaceResult) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export default function PlaceAutocomplete({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error
}: PlaceAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout>();

  // Server-side API search for places
  const searchPlaces = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Places search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (value.length >= 2) {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
      
      suggestionTimeoutRef.current = setTimeout(() => {
        searchPlaces(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    setShowSuggestions(inputValue.length >= 2);
  };

  const handleSuggestionClick = async (suggestion: PlaceResult) => {
    console.log("Suggestion clicked:", suggestion);
    
    try {
      // Get detailed place information from server
      const response = await fetch(`/api/places/details/${suggestion.placeId}`);
      const placeDetails = await response.json();
      
      const displayValue = `${suggestion.name} ${suggestion.address}`;
      onChange(displayValue);
      console.log("Setting display value:", displayValue);
      
      const enhancedPlaceData: PlaceResult = {
        ...suggestion,
        ...placeDetails
      };
      
      onChange(displayValue, enhancedPlaceData);
      console.log("Enhanced place data:", enhancedPlaceData);
    } catch (error) {
      console.error('Error getting place details:', error);
      // Fallback to basic suggestion data
      const displayValue = `${suggestion.name} ${suggestion.address}`;
      onChange(displayValue, suggestion);
    }
    
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (value.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative mt-1">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`pr-20 ${error ? 'border-red-500' : ''}`}
          autoComplete="off"
        />
        
        {value && (
          <Button
            type="button"
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Clock className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.placeId}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start space-x-3"
              >
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {suggestion.address}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}