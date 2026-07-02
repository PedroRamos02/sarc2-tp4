import { Chip } from '@mui/material';
import { alterarStatusEspaco, atualizarEspaco, criarEspaco, listarEspacos, removerEspaco } from '../../api/espacos';
import CrudPage from './CrudPage';

const CAMPOS = [
  { name: 'nome', label: 'Nome', required: true },
  { name: 'capacidade', label: 'Capacidade', type: 'number', required: true, inputProps: { min: 1 } },
  { name: 'bloco', label: 'Bloco' },
  { name: 'descricao', label: 'Descrição', type: 'textarea' },
];

export default function Laboratorios() {
  return (
    <CrudPage
      title="Laboratórios"
      newLabel="Novo laboratório"
      emptyMessage="Nenhum laboratório cadastrado."
      fetchList={() => listarEspacos({ tipo: 'LABORATORIO' })}
      fields={CAMPOS}
      initialValues={{ nome: '', capacidade: '', bloco: '', descricao: '' }}
      getFormValues={(row) => ({
        nome: row.nome || '',
        capacidade: row.capacidade ?? '',
        bloco: row.bloco || '',
        descricao: row.descricao || '',
      })}
      transformPayload={(v) => ({ ...v, tipo: 'LABORATORIO', capacidade: Number(v.capacidade) })}
      onCreate={criarEspaco}
      onUpdate={atualizarEspaco}
      onToggleStatus={(row) => alterarStatusEspaco(row.id, !row.ativo)}
      onRemove={removerEspaco}
      getItemLabel={(row) => row.nome}
      columns={[
        { key: 'nome', label: 'Nome' },
        { key: 'capacidade', label: 'Capacidade' },
        { key: 'bloco', label: 'Bloco', render: (r) => r.bloco || '—' },
        { key: 'descricao', label: 'Descrição', render: (r) => r.descricao || '—' },
        {
          key: 'ativo',
          label: 'Status',
          render: (r) => (
            <Chip label={r.ativo ? 'Ativo' : 'Inativo'} color={r.ativo ? 'success' : 'default'} size="small" />
          ),
        },
      ]}
    />
  );
}
