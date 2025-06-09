
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HealthConcernsMarquee from "@/components/HealthConcernsMarquee";
import { Search, ArrowLeft } from "lucide-react";

// Temporary data until migration is applied
const defaultHealthConcerns = [
  {
    id: '1',
    name: 'Sore Throat',
    brief_description: 'Pain or irritation in the throat, often due to infection or strain, manageable with natural remedies like honey or herbal teas.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '2',
    name: 'Depression',
    brief_description: 'Persistent sadness or loss of interest, which can be supported with natural approaches like exercise, omega-3s, or mindfulness.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '3',
    name: 'Joint Pain',
    brief_description: 'Discomfort or stiffness in joints, often linked to arthritis or injury, relieved by turmeric or gentle movement.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '4',
    name: 'Anxiety',
    brief_description: 'Excessive worry or nervousness, addressable with calming herbs like chamomile or breathing exercises.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '5',
    name: 'Fatigue',
    brief_description: 'Ongoing tiredness not relieved by rest, potentially eased with adaptogens like ashwagandha or improved sleep.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '6',
    name: 'Cold',
    brief_description: 'Common viral infection causing runny nose or cough, treatable with vitamin C or elderberry.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '7',
    name: 'High Blood Pressure',
    brief_description: 'Elevated blood pressure, manageable with hawthorn, a plant-based diet, or stress reduction.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '8',
    name: 'Headache',
    brief_description: 'Pain in the head, often due to tension or dehydration, alleviated by magnesium or peppermint oil.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '9',
    name: 'Allergies',
    brief_description: 'Reactions to pollen or food causing sneezing, treatable with quercetin or local honey.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '10',
    name: 'Stress',
    brief_description: 'Mental or physical tension, reducible with lavender, yoga, or meditation.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '11',
    name: 'Eye Strain',
    brief_description: 'Fatigue or discomfort from prolonged screen use, eased with eye exercises or bilberry.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '12',
    name: 'Back Pain',
    brief_description: 'Discomfort in the back, often from poor posture, relieved by stretching or anti-inflammatory herbs.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '13',
    name: 'Cough',
    brief_description: 'Frequent throat clearing or irritation, soothed with eucalyptus or warm teas.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '14',
    name: 'Cancer',
    brief_description: 'Serious condition involving uncontrolled cell growth, supported by immune-boosting remedies like medicinal mushrooms (consult a doctor).',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '15',
    name: 'Weak Immunity',
    brief_description: 'Frequent illness due to low immune function, strengthened with zinc or echinacea.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '16',
    name: 'Skin Irritation',
    brief_description: 'Redness or itching on the skin, treatable with aloe vera or dietary adjustments.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '17',
    name: 'Poor Circulation',
    brief_description: 'Reduced blood flow, improved with ginkgo biloba or regular movement.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '18',
    name: 'Digestive Issues',
    brief_description: 'Problems like bloating or IBS, managed with probiotics or ginger.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '19',
    name: 'Insomnia',
    brief_description: 'Difficulty sleeping, addressable with valerian root or a consistent sleep schedule.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '20',
    name: 'Hair Loss',
    brief_description: 'Thinning or loss of hair, potentially supported by biotin or scalp massages.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '21',
    name: 'Chronic Fatigue',
    brief_description: 'Persistent exhaustion not relieved by rest, eased with B vitamins or energy-boosting herbs.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '22',
    name: 'Hormonal Imbalances',
    brief_description: 'Irregular hormones (e.g., PCOS), balanced with vitex or dietary changes.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '23',
    name: 'Immune System Weakness',
    brief_description: 'Frequent infections, boosted with elderberry or medicinal mushrooms.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '24',
    name: 'Parasites',
    brief_description: 'Intestinal parasites causing digestive issues, treated with black walnut or wormwood.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '25',
    name: 'Skin Conditions',
    brief_description: 'Chronic issues like eczema, managed with tea tree oil or omega-3s.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '26',
    name: 'Low Energy and Adrenal Fatigue',
    brief_description: 'Persistent low energy from adrenal stress, supported by licorice root or rest.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '27',
    name: 'Cardiovascular Health',
    brief_description: 'Issues like high cholesterol, improved with CoQ10 or plant-based diets.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '28',
    name: 'Blood Sugar Imbalances',
    brief_description: 'Fluctuations like pre-diabetes, managed with cinnamon or low-glycemic diets.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '29',
    name: 'Respiratory Issues',
    brief_description: 'Conditions like asthma, eased with eucalyptus or breathing exercises.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '30',
    name: 'Weight Management',
    brief_description: 'Challenges with weight, supported by green tea extract or exercise.',
    remedy_count: 0,
    expert_count: 0
  }
];

const HealthConcerns = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHealthConcerns = defaultHealthConcerns.filter((concern) =>
    concern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concern.brief_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-12 px-0 py-[30px]">
      <div className="max-w-[800px] mx-auto px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 dark:hover:bg-accent-dark/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Health Concerns</h1>
          <p className="text-xl text-muted-foreground">
            Explore common health concerns and their natural remedies
          </p>
        </div>

        <HealthConcernsMarquee />

        <div className="my-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="search"
            placeholder="Search health concerns..."
            className="pl-10 w-full max-w-md bg-background dark:bg-muted/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-card dark:bg-card rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border dark:border-border">
                <TableHead>Name</TableHead>
                <TableHead>Brief Description</TableHead>
                <TableHead className="text-center">Remedies</TableHead>
                <TableHead className="text-center">Experts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHealthConcerns.map((concern) => (
                <TableRow
                  key={concern.id}
                  className="hover:bg-muted/50 dark:hover:bg-muted/10 border-border dark:border-border"
                >
                  <TableCell className="font-medium">
                    <Link
                      to={`/health-concerns/${encodeURIComponent(concern.name)}`}
                      className="text-primary hover:underline"
                    >
                      {concern.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2 text-muted-foreground">
                      {concern.brief_description || 'No description available'}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {concern.remedy_count}
                  </TableCell>
                  <TableCell className="text-center">
                    {concern.expert_count}
                  </TableCell>
                </TableRow>
              ))}
              {filteredHealthConcerns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">No health concerns found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HealthConcerns;
