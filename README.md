# DevProfile

## Formação
Nota técnica: há uma regra adicional que vale implementar antes de produção: se uma formação já estiver marcada como atual e você enviar uma data de término sem mudar current para false, o service atual rejeita a combinação apenas quando current é explicitamente true no DTO. Podemos refinar essa validação junto com os testes automatizados.


## Experiência
Um detalhe para melhorar antes de produção: no método update, se current for alterado para true, a data de término é zerada. Se a experiência já estiver marcada como atual e for enviada uma data de término sem alterar current, a validação também precisa impedir essa combinação. Podemos refinar esse caso e adicionar testes automatizados depois de confirmar que o CRUD básico está funcionando.

## Projectts
Atenção: no DTO de atualização, PartialType permite omitir os campos, mas não permite enviar null para campos opcionais tipados como string. Se você quiser permitir apagar URLs e descrições enviando null, precisaremos ajustar essa validação.