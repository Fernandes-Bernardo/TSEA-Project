package com.server.api.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.server.api.dto.ToolsDto;
import com.server.api.dto.UpdateToolDto;
import com.server.api.model.Tools;
import com.server.api.repository.ToolsRepository;

@Service
public class ToolsService {
    private final ToolsRepository toolsRepository;

    public ToolsService(ToolsRepository toolsRepository){
        this.toolsRepository = toolsRepository;
    }

    public UUID createTools(ToolsDto toolDto){
        // Dto convert to Model

        var tool = new Tools(
            UUID.randomUUID(),
            toolDto.name(),
            toolDto.description(), 
            toolDto.quantity(),
            toolDto.type(), 
            toolDto.levelSecurity(),
            Instant.now(),
            null
        );

        var toolSaved = toolsRepository.save(tool);

        return toolSaved.getId(); // Return id for create tool
    }


    public Optional<Tools> getToolById(String id){ // Optional method to obtein tool by id
        return toolsRepository.findById(UUID.fromString(id));
    }

    public List<Tools> getByName(String name){
        if(name == null || name.trim().isEmpty()){
            throw new IllegalArgumentException("Preencha o campo para buscar a peça");
        }

        var tools = toolsRepository.findByName(name);
        return tools;
    }

    public List<Tools> listTools(){
        return toolsRepository.findAll();
    }

    public void updateToolById(String id, UpdateToolDto updTool){
        var toolId = UUID.fromString(id);
        var toolExists = toolsRepository.findById(toolId);

        if(toolExists.isPresent()){
            var tool = toolExists.get();
            if(updTool.name() != null){
                tool.setName(updTool.name());
            }
            if(updTool.description() != null){
                tool.setDescription(updTool.description());
            }
            if(updTool.type() != null){
                tool.setType(updTool.type());
            }
            if(updTool.levelSecurity() != null){
                tool.setLevelSecurity(updTool.levelSecurity());
            }

            toolsRepository.save(tool);
        }
    }

    public void DeleteById(String Id){
        var id = UUID.fromString(Id);
        var toolExists = toolsRepository.existsById(id);
        if(id == null){
            throw new IllegalArgumentException("Campo não pode ser nulo.");
        }
        if (toolExists) {
            toolsRepository.deleteById(id);
        }
    }

    public void DeleteByName(String name){
        toolsRepository.findByName(name);
        if(name == null || name.trim().isEmpty()){
            throw new IllegalArgumentException("Campo não pode ser nulo");
        }
        // toolsRepository.deleteByName(name);
    }
}
