# Foundry Mobile 14

[Read in English](README.en.md)

Módulo para Foundry VTT 14 com setas para mover tokens, gestos para navegar no mapa e ajustes de layout para celulares. O modo mobile é ativado automaticamente em dispositivos que informam suporte a toque. Cada navegador pode mudar essa opção em **Configurações do jogo → Configurar configurações → Foundry Mobile 14**.

A interface do módulo acompanha o idioma selecionado no Foundry e está disponível em português do Brasil e inglês.

## Instalação

Na tela de configuração do Foundry, abra **Módulos adicionais → Instalar módulo** e cole o [link do manifesto](https://github.com/laislonhoft/foundry-mobile-14/releases/latest/download/module.json) no campo **URL do manifesto**. Depois, ative **Foundry Mobile 14** no mundo em **Gerenciar módulos**.

Para instalar manualmente, baixe o ZIP da [página de versões](https://github.com/laislonhoft/foundry-mobile-14/releases) e siga estes passos.

1. Extraia a pasta `foundry-mobile-14` do ZIP para `Data/modules/` no diretório de dados do servidor. Confira que o caminho termina em `Data/modules/foundry-mobile-14/module.json`.
2. Reinicie o Foundry, abra o mundo e ative **Foundry Mobile 14** em **Gerenciar módulos** como mestre.
3. No celular, abra o endereço habitual do mundo e entre como jogador. Use uma cena ativa e um usuário com permissão de proprietário sobre o token.

## Controles

- **Mover** abre oito setas e o botão central. Toque primeiro no token com a ferramenta de seleção do Foundry e, depois, toque nas setas. Cada toque usa um passo do movimento de teclado do Foundry. O botão central leva a câmera ao primeiro token selecionado.
- **Navegar** ativa o modo câmera. Arraste com um dedo para deslocar a cena e use dois dedos para dar zoom. Toque em **Jogar** para voltar a selecionar tokens e interagir com a cena.
- **− / +** ajustam o zoom. **Painel** abre ou fecha a barra lateral do Foundry.
- As janelas têm dimensões limitadas à tela no celular e os campos de formulário têm fonte de pelo menos 16 px. Fichas com estrutura interna própria ou largura fixa podem precisar de ajustes específicos por sistema.

## Validação na sua mesa

Passe pelas etapas abaixo com o sistema da mesa e os módulos que vocês usam.

1. Entre pelo celular como jogador. Selecione o token e teste as setas, incluindo um passo contra uma parede. Confira o resultado no navegador do mestre.
2. Teste a seleção de um token de outro jogador, o movimento com o jogo pausado e com um token bloqueado.
3. Arraste e pince o mapa. Volte a **Jogar** e teste a seleção e a interação com portas. Troque de cena e repita.
4. Abra o chat e uma ficha em retrato e paisagem. Confira a rolagem da ficha, a digitação no chat e se é possível fechar a janela com o teclado virtual aberto.
5. Acesse pelo computador com o modo automático e verifique o comportamento habitual.

Esta versão foi desenvolvida para a API da v14. O ensaio automatizado usa uma simulação do ambiente Foundry. A validação em um mundo real com Android ou iPhone ainda está pendente.
