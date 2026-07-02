import { Chip, Typography } from '@mui/material';
import {
  alterarStatusProfessor,
  atualizarProfessor,
  criarProfessor,
  listarProfessores,
  removerProfessor,
} from '../../api/professores';
import CrudPage from './CrudPage';

const CAMPOS = [
  { name: 'nome', label: 'Nome', required: true },
  { name: 'email', label: 'E-mail', type: 'email', required: true },
  { name: 'telefone', label: 'Telefone' },
  { name: 'departamento', label: 'Departamento' },
];

export default function Professores() {
  return (
    <CrudPage
      title="Professores"
      newLabel="Novo professor"
      emptyMessage="Nenhum professor cadastrado."
      fetchList={() => listarProfessores()}
      fields={CAMPOS}
      initialValues={{ nome: '', email: '', telefone: '', departamento: '' }}
      getFormValues={(row) => ({
        nome: row.nome || '',
        email: row.email || '',
        telefone: row.telefone || '',
        departamento: row.departamento || '',
      })}
      onCreate={criarProfessor}
      onUpdate={atualizarProfessor}
      onToggleStatus={(row) => alterarStatusProfessor(row.id, !row.ativo)}
      onRemove={removerProfessor}
      getItemLabel={(row) => row.nome}
      afterCreateMessage={(criado) =>
        criado?.credenciais ? (
          <>
            <Typography gutterBottom>Professor cadastrado com sucesso! Repasse as credenciais abaixo a ele:</Typography>
            <Typography variant="body2">
              <strong>E-mail:</strong> {criado.credenciais.email}
            </Typography>
            <Typography variant="body2">
              <strong>Senha temporária:</strong> {criado.credenciais.senhaTemporaria}
            </Typography>
          </>
        ) : null
      }
      columns={[
        { key: 'nome', label: 'Nome' },
        { key: 'email', label: 'E-mail' },
        { key: 'telefone', label: 'Telefone', render: (r) => r.telefone || '—' },
        { key: 'departamento', label: 'Departamento', render: (r) => r.departamento || '—' },
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
