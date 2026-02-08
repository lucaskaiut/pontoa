import React from 'react';

// Decodificador de erros React minificados
const decodeReactError = (errorMessage) => {
  if (!errorMessage) return null;
  
  // Erro #130: Objects are not valid as a React child
  const error130Match = errorMessage.match(/Minified React error #130.*?args\[\]=(\w+).*?args\[\]=(\w+)/);
  if (error130Match) {
    return {
      code: 130,
      message: `Objects are not valid as a React child (found: ${error130Match[1]} with keys: ${error130Match[2]})`,
      description: 'Este erro ocorre quando você tenta renderizar um objeto JavaScript diretamente no JSX. Verifique se algum componente está recebendo um objeto como children ou como valor de prop que deveria ser uma string/número.',
      solution: 'Garanta que todos os valores passados para componentes sejam strings, números, ou elementos React válidos. Use JSON.stringify() ou converta objetos para strings antes de renderizar.'
    };
  }
  
  // Erro #31: Objects are not valid as a React child
  const error31Match = errorMessage.match(/Minified React error #31/);
  if (error31Match) {
    return {
      code: 31,
      message: 'Objects are not valid as a React child',
      description: 'Um objeto está sendo renderizado diretamente.',
      solution: 'Converta o objeto para string antes de renderizar.'
    };
  }
  
  return null;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, decodedError: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorMessage = error?.message || error?.toString() || '';
    const decodedError = decodeReactError(errorMessage);
    
    console.error('🚨 ERROR BOUNDARY CAPTURED:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    if (decodedError) {
      console.error('📋 DECODED ERROR:', decodedError);
      console.error('💡 SOLUÇÃO:', decodedError.solution);
    }
    
    // Tentar encontrar valores problemáticos no component stack
    const componentStack = errorInfo?.componentStack || '';
    console.error('🔍 Analisando Component Stack para encontrar o componente problemático...');
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      decodedError: decodedError
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          border: '2px solid red', 
          borderRadius: '8px',
          backgroundColor: '#fee'
        }}>
          <h2 style={{ color: 'red' }}>❌ Erro capturado pelo Error Boundary</h2>
          
          {this.state.decodedError && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107',
              borderRadius: '4px'
            }}>
              <h3 style={{ marginTop: 0, color: '#856404' }}>📋 Erro Decodificado:</h3>
              <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#856404' }}>
                {this.state.decodedError.message}
              </p>
              <p style={{ margin: '10px 0', color: '#856404' }}>
                <strong>Descrição:</strong> {this.state.decodedError.description}
              </p>
              <p style={{ margin: '10px 0', color: '#856404' }}>
                <strong>💡 Solução:</strong> {this.state.decodedError.solution}
              </p>
            </div>
          )}
          
          <details style={{ marginTop: '10px' }} open={!this.state.decodedError}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              {this.state.decodedError ? 'Clique para ver detalhes técnicos completos' : 'Clique para ver detalhes do erro'}
            </summary>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
              <h3>Mensagem do Erro:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px' }}>
                {this.state.error?.toString()}
              </pre>
              
              <h3 style={{ marginTop: '20px' }}>Stack Trace:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '11px', maxHeight: '300px', overflow: 'auto' }}>
                {this.state.error?.stack}
              </pre>
              
              <h3 style={{ marginTop: '20px' }}>Component Stack:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '11px', maxHeight: '300px', overflow: 'auto' }}>
                {this.state.errorInfo?.componentStack}
              </pre>
              
              {this.state.errorInfo && (
                <>
                  <h3 style={{ marginTop: '20px' }}>Dica de Debug:</h3>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Procure no Component Stack acima por componentes relacionados a formulários, 
                    especialmente campos de "image" ou "description" na guia "Adicional". 
                    O erro geralmente ocorre quando um objeto é passado onde deveria haver uma string.
                  </p>
                </>
              )}
            </div>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#7b2cbf',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

