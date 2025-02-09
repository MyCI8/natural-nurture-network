
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type SymptomType = Database['public']['Enums']['symptom_type'];

const Symptoms = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [symptoms, setSymptoms] = useState<SymptomType[]>([]);
  const [topSymptoms, setTopSymptoms] = useState<{symptom: SymptomType, click_count: number}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    const text = "Let's get you better.";
    let index = 0;
    setIsTyping(true);

    const interval = setInterval(() => {
      if (index <= text.length) {
        setTypedText(text.slice(0, index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTopSymptoms = async () => {
      const { data, error } = await supabase.rpc('get_top_symptoms', { limit_count: 10 });
      if (error) {
        console.error('Error fetching top symptoms:', error);
        return;
      }
      setTopSymptoms(data || []);
    };

    fetchTopSymptoms();
  }, []);

  useEffect(() => {
    const allSymptoms: SymptomType[] = [
      'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
      'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
      'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
      'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
    ];
    
    setSymptoms(
      searchTerm
        ? allSymptoms.filter(s => 
            s.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : allSymptoms
    );
  }, [searchTerm]);

  const handleSymptomClick = async (symptom: SymptomType) => {
    try {
      await supabase
        .from('symptom_clicks')
        .insert([{ symptom, user_id: (await supabase.auth.getUser()).data.user?.id }]);
    } catch (error) {
      console.error('Error logging symptom click:', error);
    }
    navigate(`/symptoms/${symptom.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] bg-primary/10 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"
          style={{ top: '65%' }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-primary">
              Symptoms / Conditions
            </h1>
            <p className="text-xl md:text-2xl text-primary/80 min-h-[2em]">
              {typedText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Select Grid */}
      <section className="py-12 px-4 md:px-8">
        <h2 className="text-2xl font-bold mb-6">Most Common</h2>
        <div className="overflow-x-auto -mx-4 px-4 pb-4 md:overflow-x-visible">
          <div className="grid grid-flow-col md:grid-flow-row md:grid-cols-5 md:grid-rows-2 gap-4 md:gap-6 w-max md:w-auto">
            {topSymptoms.map(({ symptom }) => (
              <button
                key={symptom}
                onClick={() => handleSymptomClick(symptom)}
                className={cn(
                  "px-6 py-4 rounded-lg bg-accent hover:bg-accent/80",
                  "transition-colors duration-200 min-w-[160px] md:min-w-0",
                  "flex flex-col items-center justify-center gap-2"
                )}
              >
                <span className="text-lg font-medium">{symptom}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Table */}
      <section className="py-12 px-4 md:px-8">
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symptom / Condition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {symptoms.map((symptom) => (
                <TableRow
                  key={symptom}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => handleSymptomClick(symptom)}
                >
                  <TableCell className="font-medium">{symptom}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default Symptoms;
