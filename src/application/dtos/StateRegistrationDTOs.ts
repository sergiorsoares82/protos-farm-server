export interface StateRegistrationParticipantItemDTO {
  id: string;
  cpf: string;
  nome: string;
  participation: string | null;
}

export interface StateRegistrationResponseDTO {
  id: string;
  tenantId: string;
  personId: string;
  ruralPropertyId?: string | null;
  numeroIe: string;
  cpfCnpj: string | null;
  nomeResponsavel: string | null;
  nomeEstabelecimento: string | null;
  cnaeCodigo: string | null;
  cnaeDescricao: string | null;
  regimeApuracao: string | null;
  categoria: string | null;
  dataInscricao: string | null;
  dataFimContrato: string | null;
  situacao: string;
  dataSituacaoInscricao: string | null;
  cep: string | null;
  uf: string;
  municipio: string | null;
  distritoPovoado: string | null;
  bairro: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  referenciaLocalizacao: string | null;
  optanteProgramaLeite: boolean;
  participants: StateRegistrationParticipantItemDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStateRegistrationRequestDTO {
  personId: string;
  ruralPropertyId?: string | null;
  numeroIe: string;
  uf: string;
  situacao?: string;
  cpfCnpj?: string | null;
  nomeResponsavel?: string | null;
  nomeEstabelecimento?: string | null;
  cnaeCodigo?: string | null;
  cnaeDescricao?: string | null;
  regimeApuracao?: string | null;
  categoria?: string | null;
  dataInscricao?: string | null;
  dataFimContrato?: string | null;
  dataSituacaoInscricao?: string | null;
  cep?: string | null;
  municipio?: string | null;
  distritoPovoado?: string | null;
  bairro?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  referenciaLocalizacao?: string | null;
  optanteProgramaLeite?: boolean;
  participants?: { cpf: string; nome: string; participation?: string | null }[];
}

export type UpdateStateRegistrationRequestDTO = CreateStateRegistrationRequestDTO;
