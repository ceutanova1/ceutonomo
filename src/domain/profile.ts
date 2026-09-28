export type LegalStructure = "AUTONOMO" | "SL" | "UNDECIDED";

export type ActivityPreset =
  | "SOFTWARE_DEVELOPMENT"
  | "IT_CONSULTING"
  | "SAAS"
  | "ECOMMERCE"
  | "MARKETING"
  | "CALL_CENTRE"
  | "PROFESSIONAL_SERVICES"
  | "RETAIL"
  | "HOSPITALITY"
  | "TOURISM"
  | "CONSTRUCTION"
  | "OTHER";

export type BusinessProfileFacts = Readonly<{
  age?: number;
  taxResidenceCountry?: string;
  residentInCeuta?: boolean;
  residenceStartDate?: string;
  registeredInCeuta?: boolean;
  firstTimeAutonomo?: boolean;
  previousAutonomoEndDate?: string;
  previouslyUsedReducedFee?: boolean;
  unemployed?: boolean;
  registeredJobSeeker?: boolean;
  disabilityRelevant?: boolean;
  activityType?: ActivityPreset;
  activityDescription?: string;
  cnae?: string;
  iae?: string;
  legalStructure?: LegalStructure;
  newBusiness?: boolean;
  physicalEstablishmentInCeuta?: boolean;
  activityPerformedInCeuta?: boolean;
  employeesNow?: number;
  employeesPlanned?: number;
  workplaceType?: "OFFICE" | "HOME_OFFICE" | "COWORKING" | "OTHER";
  estimatedStartDate?: string;
  coveredCeutaSocialSecuritySector?: boolean;
  qualifyingCeutaIncomePercentage?: number;
  ceutaPresenceDuring2026ReferencePeriod?: boolean;
  negativelyAffectedBy2026MigrationCrisis?: boolean;
  registeredInTaxCensusBefore2026Measure?: boolean;
  required2025TaxReturnFiled?: boolean;
  company2025TurnoverEuro?: number;
}>;

export const demoBusinessProfile: BusinessProfileFacts = {
  age: 35,
  taxResidenceCountry: "ES",
  residentInCeuta: true,
  registeredInCeuta: true,
  firstTimeAutonomo: true,
  unemployed: false,
  registeredJobSeeker: false,
  disabilityRelevant: false,
  activityType: "SOFTWARE_DEVELOPMENT",
  activityDescription: "Desarrollo de software y consultoría IT para empresas",
  legalStructure: "AUTONOMO",
  newBusiness: true,
  physicalEstablishmentInCeuta: true,
  activityPerformedInCeuta: true,
  employeesNow: 0,
  employeesPlanned: 0,
  workplaceType: "HOME_OFFICE",
  coveredCeutaSocialSecuritySector: true,
  qualifyingCeutaIncomePercentage: 100,
  ceutaPresenceDuring2026ReferencePeriod: true,
};
