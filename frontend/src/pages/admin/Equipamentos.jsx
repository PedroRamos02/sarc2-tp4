import { Button, Chip } from '@mui/material';
import {
  alterarDisponibilidadeEquipamento,
  alterarStatusEquipamento,
  atualizarEquipamento,
  criarEquipamento,
  listarEquipamentos,
  removerEquipamento,
} from '../../api/equipamentos';
import CrudPage from './CrudPage';

const CAMPOS = [
  { name: 'nome', label: 'Nome', required: true },
  { name: 'tipo', label: 'Tipo', required: true },
  { name: 'quantidadeTotal', label: 'Quantidade total', type: 'number', required: true, inputProps: { min: 1 } },
];

export default function Equipamentos() {
  return (
    <CrudPage
      title="Equipamentos"
      newLabel="Novo equipamento"
      emptyMessage="Nenhum equipamento cadastrado."
      fetchList={() => listarEquipamentos()}
      fields={CAMPOS}
      initialValues={{ nome: '', tipo: '', quantidadeTotal: '' }}
      getFormValues={(row) => ({
        nome: row.nome || '',
        tipo: row.tipo || '',
        quantidadeTotal: row.quantidadeTotal ?? '',
      })}
      transformPayload={(v) => ({ ...v, quantidadeTotal: Number(v.quantidadeTotal) })}
      onCreate={criarEquipamento}
      onUpdate={atualizarEquipamento}
      onToggleStatus={(row) => alterarStatusEquipamento(row.id, !row.ativo)}
      onRemove={removerEquipamento}
      getItemLabel={(row) => row.nome}
      renderExtraActions={(row, { reload, setErro }) => (
        <Button
          size="small"
          onClick={async () => {
            try {
              await alterarDisponibilidadeEquipamento(row.id, !row.disponivel);
              reload();
            } catch (err) {
              setErro(err.response?.data?.error || 'Erro ao alterar disponibilidade');
            }
          }}
        >
          {row.disponivel ? 'Marcar em manutenção' : 'Marcar disponível'}
        </Button>
      )}
      columns={[
        { key: 'nome', label: 'Nome' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'quantidadeTotal', label: 'Quantidade total' },
        {
          key: 'disponivel',
          label: 'Disponibilidade',
          render: (r) => (
            <Chip
              label={r.disponivel ? 'Disponível' : 'Em manutenção'}
              color={r.disponivel ? 'success' : 'warning'}
              size="small"
            />
          ),
        },
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
