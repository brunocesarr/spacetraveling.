import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function ConvertToDate(dateValue: string) {
  return format(new Date(dateValue), 'dd MMM yyyy', {
    locale: ptBR,
  });
}
